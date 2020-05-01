const express = require('express');
const middleware = require('../../controllers/middlewares');
const reviewsViewsController = require('../../controllers/views/reviewsController');
const router = express.Router();

router.use(middleware.alerts);

router.use(middleware.isLoggedIn);

router.get('/reviews/:id', reviewsViewsController.getReviewDetails);

router.get('/tour/:slug/review-form',
    middleware.protect,
    middleware.restrictTo('user'),
    middleware.isAlreadyBooked,
    middleware.errorIfNotBooked,
    middleware.getTour,
    middleware.getTourReviewsUsersIds,
    middleware.errorIfUserHasReviewedTour,
    reviewsViewsController.getReviewForm);

router.get('/tour/:slug/reviews/:id/review-update-form',
    middleware.protect,
    middleware.restrictTo('user', 'admin'),
    middleware.isReviewOwner,
    reviewsViewsController.getReviewUpdateForm);

module.exports = router;