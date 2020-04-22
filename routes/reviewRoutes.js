const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'),
        reviewController.setToursUsersIds,
        reviewController.confirmBooking,
        reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'),
        viewsController.isReviewOwner,
        reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'),
    viewsController.isReviewOwner, 
    reviewController.deleteReview);

module.exports = router;