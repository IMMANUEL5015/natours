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
    const tours = await Tour.find({});

    res.status(200).render('tour/overview', {
        title: 'All Tours',
        tours
    });
});

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

exports.renderTourDetailsPage = (req, res, next) => {
    const tour = req.retrievedTour;
    res.status(200).render('tour/tour', {
        title: `${tour.name} Tour`,
        tour
    });
}

exports.getSignupForm = (req, res) => {
    res.status(200).render('user/signup', {
        title: 'Create your account',
    });
}

exports.getLoginForm = (req, res) => {
    res.status(200).render('user/login', {
        title: 'Log into your account',
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('user/account', {
        title: 'Your account page',
    });
}

exports.getForgotPasswordForm = (req, res) => {
    res.status(200).render('user/forgotPassword', {
        title: 'Forgot Password Page',
    });
}

exports.getResetPasswordForm = (req, res) => {
    res.status(200).render('user/resetPassword', {
        title: 'Reset Your Password ',
        resetToken: `${req.params.resetToken}`
    });
}

exports.getCreateTourForm = (req, res) => {
    res.status(200).render('tour/createNewTour', {
        title: 'Create New Tour',
    });
}

exports.getReviewForm = (req, res, next) => {
    const tour = req.retrievedTour;
    res.status(200).render('review/reviewForm', {
        title: `Review ${tour.name}`,
        tour
    });
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

exports.getReviewUpdateForm = (req, res, next) => {
    const review = req.review;
    res.status(200).render('review/reviewUpdateForm', {
        title: `Update Review`,
        review
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

    res.status(200).render('tour/overview', {
        title: 'My Tours',
        tours
    });
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
    res.status(200).render('tour/updateTourForm', {
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
    res.status(200).render('user/usersOverview', {
        title: 'Natours Registered Users',
        users,
        page
    });
});

exports.getDataOfSpecificUser = catchAsync(async (req, res, next) => {
    const foundUser = await User.findOne({ email: req.params.email });
    if (!foundUser) {
        return next(new AppError('This user does not exist!', 404));
    }
    res.status(200).render('user/user', {
        title: foundUser.name,
        foundUser
    });
});

exports.getReviewDetails = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('This review does not exist!', 404));
    res.status(200).render('review/review', {
        title: 'Review Details',
        review
    });
});

exports.getMyFavoriteTours = (req, res, next) => {
    res.render('tour/overview', {
        title: 'Favorite Tours',
        tours: req.user.favoriteTours
    });
}

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking') {
        res.locals.alert = "Your booking was successful. Please check your email for confirmation. If your booking does not show up right away, please come back later.";
    }
    next();
}

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

exports.getSpecificBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('This Booking Does Not Exist.', 404));
    res.status(200).render('booking/userBooking', {
        title: `Booking`,
        booking
    });
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

exports.getBookingUpdateForm = catchAsync(async(req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('This Booking Does Not Exist!', 404));
    
    return res.status(200).render('booking/bookingUpdateForm', {
        title: `Update Booking`,
        booking
    });
});