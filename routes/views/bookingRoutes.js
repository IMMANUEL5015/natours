const express = require('express');
const middleware = require('../../controllers/middlewares');
const bookingViewsController = require('../../controllers/views/bookingController');
const router = express.Router();

router.use(middleware.alerts);

router.use(middleware.isLoggedIn);

router.get('/create-new-booking', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getCreateBookingForm);

router.get('/users/:email/bookings', middleware.protect,
    middleware.restrictTo('admin'),
    bookingViewsController.getBookingsOfSpecificUser);

router.get('/users/:email/bookings/:id', middleware.protect,
    middleware.restrictTo('admin'),
    bookingViewsController.getSpecificBookingForUser);

router.get('/users/:email/bookings/:id/booking-update-form', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getBookingUpdateFormForUser);


router.get('/tour/:slug/bookings', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getTourBookings);

router.get('/tour/:slug/bookings/:id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getSpecificBookingForTour);

router.get('/tour/:slug/bookings/:id/booking-update-form', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getBookingUpdateFormForTour);

router.get('/bookings', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getAllBookings);

router.get('/bookings/:id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getBooking);

router.get('/bookings/:id/edit', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    bookingViewsController.getBookingUpdateForm);

module.exports = router;