const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/checkout-session/:tourId',
    authController.restrictTo('user'),
    bookingController.isAlreadyBooked,
    bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
    .post(bookingController.setTourUserIds, bookingController.createBooking)
    .get(bookingController.getAllBookings);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.setTourUserIds, bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;