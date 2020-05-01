const express = require('express');
const userController = require('../../controllers/api/userController');
const authController = require('../../controllers/api/authController');
const middleware = require('../../controllers/middlewares');
const factory = require('../../controllers/api/handlerFactory');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(middleware.protect);

router.patch('/updatePassword', authController.updatePassword);

router.route('/me')
    .get(factory.getMe, userController.getUser)
    .patch(
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe)
    .delete(userController.deleteMe);

router.use(middleware.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router.get('/:id/bookings', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    userController.getBookingsForUser);

router.get('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    userController.getSpecificBookingForUser);

router.patch('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    middleware.setTourUserIds,
    userController.updateSpecificBookingForUser);

router.delete('/:id/bookings/:booking_id', middleware.protect,
    middleware.restrictTo('admin', 'lead-guide'),
    userController.deleteSpecificBookingForUser);

module.exports = router;