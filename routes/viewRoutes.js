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
    viewsController.getTour);

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
module.exports = router;