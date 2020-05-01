const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, req, res) => {
    //Prevent the password from showing up in the output
    user.password = undefined;
    const token = signToken(user.id);
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        photo: req.body.photo,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide your email address and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(`Incorrect email or password. If you have forgotten your password, please click on the forgot password link.`, 401));
    }

    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expiresIn: new Date(Date.now() + (10 * 1000)),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success',
        message: 'You have been logged out successfully.'
    });
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1. Get the provided email
    const email = req.body.email;
    if (!email) {
        return next(new AppError('Please provide your email address.', 400));
    }

    //2. Find the user based on their email address
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email address.', 404));
    }

    //3. Generate a random reset token (not JWT)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //4. Send the token to the user's email address
    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        await new Email(user, resetUrl).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save;
        return next(new AppError('There was an error sending the email', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. Return an error for bad requests
    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm) {
        return next(new AppError('Please provide your password and confirm it.', 400));
    }

    //2.Encrypt the unencrypted token in order to compare it with the one in the DB. 
    const hashedToken = crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //3.Get user based on token if token has not expired and if user still exists
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }

    //4. Set the new password if all goes well
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //5. Update the passwordChangedAt property

    //6. Log the user in
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1. Find the logged in user
    const user = await User.findById(req.user._id).select('+password');

    //2. Ensure that the current, new and confirm passwords are in the body of the request.
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        const message = 'Please provide your current password, new password and confirm your new password';
        return next(new AppError(message, 400));
    }

    //3. Check if the current password is correct
    const confirmUserPassword = await user.correctPassword(currentPassword, user.password);
    if (!confirmUserPassword) {
        return next(new AppError('Please provide the correct password', 400));
    }

    //4. Update the user password, hash it and Update the passwordChangedAt property
    user.password = newPassword;
    user.passwordConfirm = confirmNewPassword;
    await user.save();

    //5. Log in the user
    createSendToken(user, 200, req, res);
});