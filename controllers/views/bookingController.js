const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Booking = require('../../models/bookingModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.getCreateBookingForm = (req, res, next) => {
    res.status(200).render('booking/createBookingForm', {
        title: 'Create New Booking'
    });
}

exports.getTourBookings = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug });
    const bookings = await Booking.find({ tour: tour._id });
    res.status(200).render('booking/tourBookings', {
        title: `${tour.name} Bookings`,
        bookings,
        tour
    });
});

exports.getSpecificBookingForTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug });
    const bookings = await Booking.find({ tour: tour._id });

    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.id)) {
            return res.status(200).render('booking/tourBooking', {
                title: `Booking`,
                booking: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this tour', 404));
});

exports.getBookingUpdateFormForTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug });
    const bookings = await Booking.find({ tour: tour._id });

    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.id)) {
            return res.status(200).render('booking/tourBookingUpdateForm', {
                title: `Booking`,
                booking: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this tour', 404));
});

exports.getBookingsOfSpecificUser = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.params.email });
    const bookings = await Booking.find({ user: user._id });
    res.status(200).render('booking/userBookings', {
        title: `${user.name} Bookings`,
        bookings,
        user
    });
});

exports.getSpecificBookingForUser = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.params.email });
    const bookings = await Booking.find({ user: user._id });

    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.id)) {
            return res.status(200).render('booking/userBooking', {
                title: `Booking`,
                booking: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this user', 404));
});

exports.getBookingUpdateFormForUser = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.params.email });
    const bookings = await Booking.find({ user: user._id });

    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.id)) {
            return res.status(200).render('booking/userBookingUpdateForm', {
                title: `Booking`,
                booking: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this user', 404));
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({});
    res.status(200).render('booking/bookings', {
        title: 'All Bookings',
        bookings
    });
});

exports.getBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('This Booking Does Not Exist!', 404));
    res.status(200).render('booking/booking', {
        title: 'Booking',
        booking
    });
});

exports.getBookingUpdateForm = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('This Booking Does Not Exist!', 404));

    return res.status(200).render('booking/bookingUpdateForm', {
        title: `Update Booking`,
        booking
    });
});