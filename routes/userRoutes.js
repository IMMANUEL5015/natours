const express = require('express');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const factory = require('../controllers/handlerFactory');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.route('/me')
    .get(factory.getMe, userController.getUser)
    .patch(
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe)
    .delete(userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router.get('/:id/bookings', authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.getBookingsForUser);

router.get('/:id/bookings/:booking_id', authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.getSpecificBookingForUser);

router.patch('/:id/bookings/:booking_id', authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.setTourUserIds,
    userController.updateSpecificBookingForUser);

router.delete('/:id/bookings/:booking_id', authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.deleteSpecificBookingForUser);

module.exports = router;