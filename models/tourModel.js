const mongoose = require('mongoose');
//const User = require('./userModel');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour should have a name.'],
        unique: true,
        trim: true,
        maxlength: [40, 'The name of a tour should not exceed 40 characters.'],
        minlength: [10, 'The name of a tour should not be lower than 10 characters.']
        //validate: [validator.isAlpha, 'Tour name should only contain Alphabetical Characters.']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour should have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour should have a group size.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour should have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty level can only either be easy or medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating should not be lower than 1.0'],
        max: [5, 'Rating should not exceed 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour should have a price.']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (value) {
                return value < this.price;
            },
            message: 'Discount Price {{VALUE}} should be below the actual price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour should have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour should have an image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//DOCUMENT MIDDLEWARE

//Works on save and create
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
/*
//EMBEDDING GUIDES IN A TOUR
tourSchema.pre('save', async function (next) {
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
});
*/
/*
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});

tourSchema.pre('save', function (next) {
    console.log('Will save document');
    next();
});
*/

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    //console.log(docs);
    console.log(`Query took ${Date.now() - this.start} milliseconds to run.`);
    next();
});

//AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
    if (!this.pipeline()[0].$geoNear) {
        this.pipeline().unshift({ $match: { secretTour: false } });
        next();
    }
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;