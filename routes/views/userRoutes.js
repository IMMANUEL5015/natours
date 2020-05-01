const express = require('express');
const middleware = require('../../controllers/middlewares');
const userViewsController = require('../../controllers/views/userController');
const router = express.Router();

router.use(middleware.alerts);

router.get('/forgot-password', userViewsController.getForgotPasswordForm);
router.get('/reset-password/:resetToken', userViewsController.getResetPasswordForm);

router.get('/me', middleware.protect, userViewsController.getAccount);
router.get('/my-tours', middleware.protect, userViewsController.getMyTours);
//router.post('/submit-user-data', middleware.protect, viewsController.updateUserData);

router.use(middleware.isLoggedIn);

router.get('/login', userViewsController.getLoginForm);
router.get('/signup', userViewsController.getSignupForm);

router.get('/users',
    middleware.protect,
    middleware.restrictTo('admin'),
    userViewsController.getUsersOverviewPage);

router.get('/users/:email', middleware.protect,
    middleware.restrictTo('admin'),
    userViewsController.getDataOfSpecificUser);

router.get('/my-favorite-tours', middleware.protect,
    middleware.restrictTo('user'),
    userViewsController.getMyFavoriteTours);

module.exports = router;