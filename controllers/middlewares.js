const fs = require('fs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    //1. Check if token is available
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) return next(new AppError('Please login to gain access to this resource', 401));

    //2. Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

    //3. Check if the owner of the token still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The owner of the login credentials no longer exists.', 401));
    }

    //4. Check if the user's password was changed after the token was issued
    if (currentUser.changedPasswordAfterTokenWasIssued(decoded.iat)) {
        return next(new AppError('Password was changed recently. Please login again.', 401));
    }

    //Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
    try {
        //1. Check if token is available
        if (req.cookies.jwt) {
            //2. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.SECRET);

            //3. Check if the owner of the token still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //4. Check if the user's password was changed after the token was issued
            if (currentUser.changedPasswordAfterTokenWasIssued(decoded.iat)) {
                return next();
            }

            //There is a logged in user
            req.user = currentUser;
            res.locals.user = currentUser;
            return next();
        }
        return next();
    } catch (err) {
        return next();
    }
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action!', 403));
        }
        next();
    }
}

exports.getTour = catchAsync(async (req, res, next) => {
    const retrievedTour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!retrievedTour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    req.retrievedTour = retrievedTour;
    next();
});

exports.getTourReviewsUsersIds = (req, res, next) => {
    const tour = req.retrievedTour;
    const tourReviews = tour.reviews;
    let reviewsUserIds = [];
    let userHasReviewedTour = false;
    for (var i = 0; i < tourReviews.length; i++) {
        reviewsUserIds.push(tourReviews[i].user._id);
    }

    //3. Check if the currently logged in user has reviewed this tour
    for (var i = 0; i < reviewsUserIds.length; i++) {
        if (req.user && (reviewsUserIds[i].equals(req.user._id))) {
            userHasReviewedTour = true;
            i = reviewsUserIds.length;
            req.user.userHasReviewedTour = userHasReviewedTour;
        }
    }
    res.locals.userHasReviewedTour = userHasReviewedTour;
    next();
}

exports.errorIfUserHasReviewedTour = (req, res, next) => {
    if (req.user.userHasReviewedTour) return next(new AppError('You cannot review a tour twice.', 403));

    next();
}

exports.isReviewOwner = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('This review does not exist'), 404);

    if (req.user.id === review.user.id || req.user.role === 'admin') {
        req.review = review;
        return next()
    }
    return next(new AppError('You can neither update nor delete a review you did not create.', 403));
});

exports.isAlreadyBooked = catchAsync(async (req, res, next) => {
    if (req.user) {
        //1. Get all the users current bookings
        const bookings = await Booking.find({ user: req.user.id });

        if (req.params.slug) {
            //2. Check to see if one of the bookings exist for the tour about to be booked
            const tourSlugs = bookings.map(el => slugify(el.tour.name.toLowerCase()));
            //3. If a booking already exists for the tour, return an error
            if (tourSlugs.includes(req.params.slug)) {
                res.locals.user.hasAlreadyBookedTour = true;
                req.user.hasAlreadyBookedTour = true;
            } else {
                res.locals.user.hasAlreadyBookedTour = false;
                req.user.hasAlreadyBookedTour = false;
            }
        }

        if (req.params.id) {
            //2. Check to see if one of the bookings exist for the tour about to be booked
            const tourIds = bookings.map(el => el.tour.id);
            //3. If a booking already exists for the tour, return an error
            if (tourIds.includes(req.params.id)) {
                res.locals.user.hasAlreadyBookedTour = true;
                req.user.hasAlreadyBookedTour = true;
            } else {
                res.locals.user.hasAlreadyBookedTour = false;
                req.user.hasAlreadyBookedTour = false;
            }
        }
    }
    next();
});

exports.errorIfNotBooked = (req, res, next) => {
    if (req.user.hasAlreadyBookedTour) return next();
    return next(new AppError('You must book this tour first.', 403));
}

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

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking') {
        res.locals.alert = "Your booking was successful. Please check your email for confirmation. If your booking does not show up right away, please come back later.";
    }
    if (alert === 'tour_created') {
        res.locals.alert = "Tour Created Successfully!";
    }
    next();
}

exports.AlreadyBooked = catchAsync(async (req, res, next) => {
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

exports.setTourUserIds = catchAsync(async (req, res, next) => {
    if (req.body.tour.startsWith('5') && req.body.user.startsWith('5')) return next();

    req.body.tour = (await Tour.findOne({ name: req.body.tour })).id;
    req.body.user = (await User.findOne({ email: req.body.user })).id;
    next();
});

exports.setToursUsersIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
}

exports.confirmBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findOne({ tour: req.body.tour, user: req.body.user });
    if (!booking) {
        return next(new AppError('You cannot review this tour because you have not booked it!', 403));
    }
    next();
});

exports.isAlreadyAFavorite = (req, res, next) => {
    if (req.user) {
        if (req.params.id) {
            if (req.user.favoriteTours.includes(req.params.id)) {
                return next(new AppError('This tour is already one of your favorite tours.', 403));
            }
        }

        if (req.params.slug) {
            const favouriteTours = req.user.favoriteTours;
            const favoriteToursSlugs = favouriteTours.map(el => el.slug);
            if (favoriteToursSlugs.includes(req.params.slug)) {
                res.locals.user.isAlreadyAFavorite = true;
            }
        }
    }

    next();
}