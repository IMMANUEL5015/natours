const Tour = require('../../models/tourModel');
const catchAsync = require('../../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find({});

    res.status(200).render('tour/overview', {
        title: 'All Tours',
        tours
    });
});

exports.renderTourDetailsPage = (req, res, next) => {
    const tour = req.retrievedTour;
    res.status(200).render('tour/tour', {
        title: `${tour.name} Tour`,
        tour
    });
}

exports.getCreateTourForm = (req, res) => {
    res.status(200).render('tour/createNewTour', {
        title: 'Create New Tour',
    });
}

exports.createNewTour = catchAsync(async (req, res, next) => {
    await Tour.create({
        imageCover: req.body.imageCover,
        images: req.body.images,
        name: req.body.name,
        price: req.body.price,
        duration: req.body.duration,
        maxGroupSize: req.body.maxGroupSize,
        difficulty: req.body.difficulty,
        summary: req.body.summary,
        description: req.body.description,
        startDates: req.body.startDates,
        startLocation: req.body.startLocation,
        locations: req.body.locations,
        guides: req.body.guides
    });
    res.redirect('/?alert=tour_created');
});

exports.getUpdateTourForm = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug });
    res.status(200).render('tour/updateTourForm', {
        title: 'Update Tour',
        tour
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;
    await Tour.findOneAndUpdate({ slug }, {
        imageCover: req.body.imageCover,
        images: req.body.images,
        name: req.body.name,
        price: req.body.price,
        duration: req.body.duration,
        maxGroupSize: req.body.maxGroupSize,
        difficulty: req.body.difficulty,
        summary: req.body.summary,
        description: req.body.description,
        startDates: req.body.startDates,
        startLocation: req.body.startLocation,
        locations: req.body.locations,
        guides: req.body.guides
    }, {
            new: true,
            runValidators: true
        });
    req.flash('success', 'Tour updated successfully!');
    res.redirect(`/tour/${slug}`);
});