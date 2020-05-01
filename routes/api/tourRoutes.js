const express = require('express');
const tourController = require('../../controllers/api/tourController');
const middleware = require('../../controllers/middlewares');
const reviewRoutes = require('./reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRoutes);

router.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(middleware.protect,
    middleware.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

router.route('/')
    .get(tourController.getAllTours)
    .post(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(middleware.protect,
        middleware.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

router.patch('/:id/add-to-favorites',
    middleware.protect,
    middleware.restrictTo('user'),
    middleware.isAlreadyBooked,
    middleware.errorIfNotBooked,
    middleware.isAlreadyAFavorite,
    tourController.addTourToUserFavorites);

router.delete('/:id/remove-from-favorites',
    middleware.protect,
    middleware.restrictTo('user'),
    middleware.isAlreadyBooked,
    middleware.errorIfNotBooked,
    tourController.removeTourFromUserFavorites);

router.get('/:id/bookings', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    tourController.getBookingsForTour);

router.get('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    tourController.getSpecificBookingForTour);

router.patch('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    middleware.setTourUserIds,
    tourController.updateSpecificBookingForTour);

router.delete('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    tourController.deleteSpecificBookingForTour);

module.exports = router;