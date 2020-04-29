const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image. Please upload an image file!', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    //1. Create an error if users attempt to update their password
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('You cannot update your password here.', 400));
    }

    //2.Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    //3. Update the user data
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteUser = factory.deleteOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getBookingsForUser = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.params.id });
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings
    })
});

exports.getSpecificBookingForUser = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.params.id });
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.booking_id)) {
            return res.status(200).json({
                status: 'success',
                data: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this user', 404));
});

exports.updateSpecificBookingForUser = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.params.id });
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.booking_id)) {
            const booking = await Booking.findByIdAndUpdate(req.params.booking_id, req.body, {
                new: true
            });
            return res.status(200).json({
                status: 'success',
                data: booking
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this user', 404));
});

exports.deleteSpecificBookingForUser = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.params.id });
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.booking_id)) {
            await Booking.findByIdAndDelete(req.params.booking_id);
            return res.status(204).json({
                status: 'success',
                data: null
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this user', 404));
});