const Review = require('../../models/reviewModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.getReviewForm = (req, res, next) => {
    const tour = req.retrievedTour;
    res.status(200).render('review/reviewForm', {
        title: `Review ${tour.name}`,
        tour
    });
}

exports.getReviewUpdateForm = (req, res, next) => {
    const review = req.review;
    res.status(200).render('review/reviewUpdateForm', {
        title: `Update Review`,
        review
    });
}

exports.getReviewDetails = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('This review does not exist!', 404));
    res.status(200).render('review/review', {
        title: 'Review Details',
        review
    });
});