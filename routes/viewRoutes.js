const express = require('express');
const viewsController = require('../controllers/viewsController');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get('/forgot-password', viewsController.getForgotPasswordForm);
router.get('/reset-password/:resetToken', viewsController.getResetPasswordForm);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

router.route('/create-new-tour')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        viewsController.getCreateTourForm)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        viewsController.constructFields,
        viewsController.createNewTour);

router.route('/update-tour/:slug')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        viewsController.getUpdateTourForm)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        viewsController.setDatesAndImages,
        viewsController.constructFields,
        viewsController.updateTour);

router.use(authController.isLoggedIn);

router.get('/', bookingController.createBookingCheckout,
    viewsController.getOverview);

router.get('/tour/:slug',
    viewsController.isAlreadyBooked,
    viewsController.getTour,
    viewsController.getTourReviewsUsersIds,
    tourController.isAlreadyAFavorite,
    viewsController.renderTourDetailsPage);

router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.get('/users',
    authController.protect,
    authController.restrictTo('admin'),
    viewsController.getUsersOverviewPage);

router.route('/users/:id')
    .get(authController.protect,
        authController.restrictTo('admin'),
        viewsController.getDataOfSpecificUser)

router.get('/reviews/:id', viewsController.getReviewDetails);

router.get('/tour/:slug/review-form',
    authController.protect,
    authController.restrictTo('user'),
    viewsController.isAlreadyBooked,
    viewsController.errorIfNotBooked,
    viewsController.getTour,
    viewsController.getTourReviewsUsersIds,
    viewsController.errorIfUserHasReviewedTour,
    viewsController.getReviewForm);

router.get('/tour/:slug/reviews/:id/review-update-form',
    authController.protect,
    authController.restrictTo('user', 'admin'),
    viewsController.isReviewOwner,
    viewsController.getReviewUpdateForm);

router.get('/my-favorite-tours', authController.protect,
    authController.restrictTo('user'),
    viewsController.getMyFavoriteTours);
module.exports = router;