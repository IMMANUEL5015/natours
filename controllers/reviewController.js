const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);