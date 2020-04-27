const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.isAlreadyBooked = catchAsync(async (req, res, next) => {
    //1. Get all the users current bookings
    const bookings = await Booking.find({ user: req.user.id });

    //2. Check to see if one of the bookings exist for the tour about to be booked
    const tourIds = bookings.map(el => el.tour.id);

    //3. If a booking already exists for the tour, return an error
    if (tourIds.includes(req.params.tourId)) {
        return next(new AppError('You cannot book thesame tour twice', 400));
    }
    //4. Else return next
    next();
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        //success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session
    });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;
//     if (!tour || !user || !price) return next();
//     await Booking.create({ tour, user, price });
//     res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price })
}

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
        return res.status(200).json({ recieved: true });
    }
}

exports.setTourUserIds = catchAsync(async (req, res, next) => {
    if (req.body.tour.startsWith('5') && req.body.user.startsWith('5')) return next();

    req.body.tour = (await Tour.findOne({ name: req.body.tour })).id;
    req.body.user = (await User.findOne({ email: req.body.user })).id;
    next();
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);