const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../../models/tourModel');
const Booking = require('../../models/bookingModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');
const slugify = require('slugify');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files can be uploaded!', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);
//upload.array('images', 3) - Expecting multiple images from a single field

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    const tourId = slugify(req.body.name, { lower: true });

    if ((!req.files || !req.files.imageCover) || (!req.files || !req.files.images)) return next();

    //1. Process imageCover
    req.body.imageCover = `tour-${tourId}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //2. Process images
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }));
    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
    next();
}

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        return next(new AppError('Please provide lattitude and longitude of your current location in the format: lat,lng', 400));
    }
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    const tours = await Tour.find({
        startLocation: {
            $geoWithin:
            {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        return next(new AppError('Please provide lattitude and longitude of your current location in the format: lat,lng', 400));
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                //_id: '$ratingsAverage',
                numOfMatchingTours: { $sum: 1 },
                numOfRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { numOfMatchingTours: 1 }
        },
        /*
        {
            $match: { _id: { $ne: 'EASY' } }
        }
        */
    ]);

    res.status(200).json({
        status: 'Success',
        results: stats.length,
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfTours: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numOfTours: -1 }
        },
        /*
        {
            $limit: 6
        }
        */
    ]);

    res.status(200).json({
        status: 'Success',
        results: plan.length,
        data: {
            plan
        }
    });
});

exports.addTourToUserFavorites = catchAsync(async (req, res, next) => {
    const user = req.user;
    user.favoriteTours.push(req.params.id);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'This tour is now one of your favorite tours.'
    });
});

exports.removeTourFromUserFavorites = catchAsync(async (req, res, next) => {
    let user = req.user;
    for (var i = 0; i < user.favoriteTours.length; i++) {
        if (user.favoriteTours[i].id === req.params.id) {
            user.favoriteTours.splice(i, 1);
            await user.save({ validateBeforeSave: false });
            i = user.favoriteTours.length;

            return res.status(200).json({
                status: 'success',
                message: 'This tour is no longer one of your favorite tours.'
            });
        }
    }

    res.status(400).json({
        status: 'fail',
        message: 'This tour is not among your favorite tours.'
    });
});

exports.getBookingsForTour = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ tour: req.params.id });
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings
    });
});

exports.getSpecificBookingForTour = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ tour: req.params.id });
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.booking_id)) {
            return res.status(200).json({
                status: 'success',
                data: bookings[i]
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this tour', 404));
});

exports.updateSpecificBookingForTour = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ tour: req.params.id });
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
    return next(new AppError('This booking does not exist or does not belong to this tour', 404));
});

exports.deleteSpecificBookingForTour = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ tour: req.params.id });
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i]._id.equals(req.params.booking_id)) {
            await Booking.findByIdAndDelete(req.params.booking_id);
            return res.status(204).json({
                status: 'success',
                data: null
            });
        }
    }
    return next(new AppError('This booking does not exist or does not belong to this tour', 404));
});