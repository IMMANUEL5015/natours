const express = require('express');
const middleware = require('../../controllers/middlewares');
const tourViewsController = require('../../controllers/views/tourController');
const tourController = require('../../controllers/api/tourController');
const router = express.Router();

router.use(middleware.alerts);

router.use(middleware.isLoggedIn);

router.get('/',
    //bookingController.createBookingCheckout,
    tourViewsController.getOverview);

router.route('/create-new-tour')
    .get(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourViewsController.getCreateTourForm)
    .post(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        middleware.constructFields,
        tourViewsController.createNewTour);

router.get('/tour/:slug',
    middleware.isAlreadyBooked,
    middleware.getTour,
    middleware.getTourReviewsUsersIds,
    middleware.isAlreadyAFavorite,
    tourViewsController.renderTourDetailsPage);

router.route('/update-tour/:slug')
    .get(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourViewsController.getUpdateTourForm)
    .post(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        middleware.setDatesAndImages,
        middleware.constructFields,
        tourViewsController.updateTour);

module.exports = router;