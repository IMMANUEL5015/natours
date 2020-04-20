const fs = require('fs');
const { promisify } = require('util');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');

exports.getOverview = catchAsync(async (req, res, next) => {
    //1. Get all the Tours data from the collection
    const tours = await Tour.find({});
    //2. Build Template with all the Tours data

    //3. Render the template

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //1. Get the data of the tour including the tour guides and reviews
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    //2. Build the template with the tour data
    //3. Render the template
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create your account',
    });
}

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account page',
    });
}

exports.getForgotPasswordForm = (req, res) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgot Password Page',
    });
}

exports.getResetPasswordForm = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'Reset Your Password ',
        resetToken: `${req.params.resetToken}`
    });
}

exports.getCreateTourForm = (req, res) => {
    res.status(200).render('createNewTour', {
        title: 'Create New Tour',
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
            new: true,
            runValidators: true
        });

    res.status(200).render('account', {
        title: 'Your account page',
        user: updatedUser
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    //1. Find all the bookings that belong to the logged in user
    const bookings = await Booking.find({ user: req.user.id });

    //2. Find all the tours for each booking
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.isAlreadyBooked = catchAsync(async (req, res, next) => {
    if (req.user) {
        //1. Get all the users current bookings
        const bookings = await Booking.find({ user: req.user.id });
        //2. Check to see if one of the bookings exist for the tour about to be booked
        const tourSlugs = bookings.map(el => slugify(el.tour.name.toLowerCase()));
        //3. If a booking already exists for the tour, return an error
        if (tourSlugs.includes(req.params.slug)) {
            res.locals.user.hasAlreadyBookedTour = true;
        }
    }
    next();
});
exports.constructFields = (req, res, next) => {
    //startDates
    req.body.startDates = [
        req.body.dateOne,
        req.body.dateTwo,
        req.body.dateThree,
    ]

    //startLocation
    req.body.startLocation = {
        address: req.body.startLocationAddress,
        description: req.body.startLocationDescription,
        coordinates: [req.body.longitudeOfStartLocation, req.body.latitudeOfStartLocation],
        type: 'Point'
    }

    //locations
    req.body.locations = [];

    const secondLocation = {
        address: req.body.secondLocationAddress,
        description: req.body.secondLocationDescription,
        coordinates: [req.body.longitudeOfSecondLocation, req.body.latitudeOfSecondLocation],
        day: req.body.dayToVisitSecondLocation
    }

    const thirdLocation = {
        address: req.body.thirdLocationAddress,
        description: req.body.thirdLocationDescription,
        coordinates: [req.body.longitudeOfThirdLocation, req.body.latitudeOfThirdLocation],
        day: req.body.dayToVisitThirdLocation
    }

    const fourthLocation = {
        address: req.body.fourthLocationAddress,
        description: req.body.fourthLocationDescription,
        coordinates: [req.body.longitudeOfFourthLocation, req.body.latitudeOfFourthLocation],
        day: req.body.dayToVisitFourthLocation
    }

    const fifthLocation = {
        address: req.body.fifthLocationAddress,
        description: req.body.fifthLocationDescription,
        coordinates: [req.body.longitudeOfFifthLocation, req.body.latitudeOfFifthLocation],
        day: req.body.dayToVisitFifthLocation
    }

    const sixthLocation = {
        address: req.body.sixthLocationAddress,
        description: req.body.sixthLocationDescription,
        coordinates: [req.body.longitudeOfSixthLocation, req.body.latitudeOfSixthLocation],
        day: req.body.dayToVisitSixthLocation
    }

    const locations = [secondLocation, thirdLocation, fourthLocation, fifthLocation, sixthLocation];

    for (var i = 0; i < locations.length; i++) {
        if (locations[i].description) req.body.locations.push(locations[i]);
    }

    //guides
    req.body.guides = [];
    if (req.body.firstGuideId) req.body.guides.push(req.body.firstGuideId);
    if (req.body.secondGuideId) req.body.guides.push(req.body.secondGuideId);
    if (req.body.thirdGuideId) req.body.guides.push(req.body.thirdGuideId);

    next();
}

exports.createNewTour = catchAsync(async (req, res, next) => {
    await Tour.create({
        imageCover: req.body.imageCover,
        images: req.body.images,
        name: req.body.name,
        price: req.body.price,
        duration: req.body.duration,
        maxGroupSize: req.body.maxGroupSize,
        difficulty: req.body.difficulty,
        summary: req.body.summary,
        description: req.body.description,
        startDates: req.body.startDates,
        startLocation: req.body.startLocation,
        locations: req.body.locations,
        guides: req.body.guides
    });
    req.flash('success', 'You have successfully created a new tour!');
    res.redirect('/');
});

exports.getUpdateTourForm = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug });
    res.status(200).render('updateTourForm', {
        title: 'Update Tour',
        tour
    });
});


exports.setDatesAndImages = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: 'the-mountain-biker' })
        .select({ images: 1, imageCover: 1, startDates: 1 });

    //startDates
    req.body.dateOne = req.body.dateOne || tour.startDates[0];
    req.body.dateTwo = req.body.dateTwo || tour.startDates[1];
    req.body.dateThree = req.body.dateThree || tour.startDates[2];

    //Delete outdated images from our file system
    if (req.body.imageCover && req.body.images.length > 1) {
        const images = [tour.imageCover, tour.images[0], tour.images[1], tour.images[2]];
        const unlink = promisify(fs.unlink);
        for (var i = 0; i < images.length; i++) {
            await unlink(`${__dirname}/../public/img/tours/${images[i]}`);
        }
    }

    //images
    req.body.imageCover = req.body.imageCover || tour.imageCover;
    req.body.images = req.body.images || tour.images;

    next();
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;
    await Tour.findOneAndUpdate({ slug }, {
        imageCover: req.body.imageCover,
        images: req.body.images,
        name: req.body.name,
        price: req.body.price,
        duration: req.body.duration,
        maxGroupSize: req.body.maxGroupSize,
        difficulty: req.body.difficulty,
        summary: req.body.summary,
        description: req.body.description,
        startDates: req.body.startDates,
        startLocation: req.body.startLocation,
        locations: req.body.locations,
        guides: req.body.guides
    }, {
            new: true,
            runValidators: true
        });
    req.flash('success', 'Tour updated successfully!');
    res.redirect(`/tour/${slug}`);
});

exports.getUsersOverviewPage = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 9;
    const users = await User.find({}).skip(skip).limit(9);
    res.status(200).render('usersOverview', {
        title: 'Natours Registered Users',
        users,
        page
    });
});

exports.getDataOfSpecificUser = catchAsync(async (req, res, next) => {
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) {
        return next(new AppError('This user does not exist!', 404));
    }
    res.status(200).render('user', {
        title: foundUser.name,
        foundUser
    });
});

exports.getReviewDetails = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('This review does not exist!', 404));
    res.status(200).render('review', {
        title: 'Review Details',
        review
    });
});