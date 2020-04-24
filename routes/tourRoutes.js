const express = require('express');
const tourController = require('../controllers/tourController');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const reviewRoutes = require('./reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRoutes);

router.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

router.patch('/:id/add-to-favorites',
    authController.protect,
    authController.restrictTo('user'),
    viewsController.isAlreadyBooked,
    viewsController.errorIfNotBooked,
    tourController.isAlreadyAFavorite,
    tourController.addTourToUserFavorites);

router.delete('/:id/remove-from-favorites',
    authController.protect,
    authController.restrictTo('user'),
    viewsController.isAlreadyBooked,
    viewsController.errorIfNotBooked,
    tourController.removeTourFromUserFavorites);

module.exports = router;