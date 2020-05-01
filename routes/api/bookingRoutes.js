const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/api/bookingController');
const middleware = require('../../controllers/middlewares');

router.use(middleware.protect);

router.get('/checkout-session/:tourId',
    middleware.restrictTo('user'),
    middleware.AlreadyBooked,
    bookingController.getCheckoutSession);

router.use(middleware.restrictTo('admin', 'lead-guide'));

router.route('/')
    .post(middleware.setTourUserIds, bookingController.createBooking)
    .get(bookingController.getAllBookings);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(middleware.setTourUserIds, bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;