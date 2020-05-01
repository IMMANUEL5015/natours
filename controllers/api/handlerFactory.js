const APIFeatures = require('../../utils/apiFeatures');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('This tour does not exist or has already been deleted.', 404));
    }
    res.status(204).json({
        status: 'Success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) {
        return next(new AppError(`Unable to Find ${Model}.`, 404));
    }
    res.status(200).json({
        status: 'Success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        status: 'Success',
        data: {
            data: newDoc
        }
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
}

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) return next(new AppError(`No ${Model} Found With That ID`, 404));
    res.status(200).json({
        status: 'Success',
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //To allow for nested reviews on a specific tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    //const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
        status: 'Success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});