const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

//Prevent a user from booking thesame tour twice
bookingSchema.index({ user: 1 });
bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

//Remove A Tour From A User's Favorites List When The Corresponding Booking Is Deleted
bookingSchema.pre(/^findOneAndDelete/, async function (next) {
    this.booking = await this.findOne();
    next();
});

bookingSchema.post(/^findOneAndDelete/, async function () {
    const User = require('./userModel');
    const bookingOwner = await User.findById(this.booking.user._id);
    for (var i = 0; i < bookingOwner.favoriteTours.length; i++) {
        if (bookingOwner.favoriteTours[i]._id.equals(this.booking.tour.id)) {
            bookingOwner.favoriteTours.splice(i, 1);
            return await bookingOwner.save({ validateBeforeSave: false });
        }
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;