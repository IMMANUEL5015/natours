const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Booking = require('../../models/bookingModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

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

/*
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
*/
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

exports.getMyFavoriteTours = (req, res, next) => {
    res.render('tour/overview', {
        title: 'Favorite Tours',
        tours: req.user.favoriteTours
    });
}

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