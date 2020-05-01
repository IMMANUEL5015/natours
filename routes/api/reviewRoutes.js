const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../../controllers/api/reviewController');
const middleware = require('../../controllers/middlewares');

router.use(middleware.protect);

router.route('/')
    .get(reviewController.getAllReviews)
    .post(middleware.restrictTo('user'),
        middleware.setToursUsersIds,
        middleware.confirmBooking,
        reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(middleware.restrictTo('user', 'admin'),
        middleware.isReviewOwner,
        reviewController.updateReview)
    .delete(middleware.restrictTo('user', 'admin'),
        middleware.isReviewOwner,
        reviewController.deleteReview);

module.exports = router;