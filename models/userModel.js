const fs = require('fs');
const { promisify } = require('util');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Booking = require('./bookingModel');
const Review = require('./reviewModel');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide your email address.'],
        validate: [validator.isEmail, 'Please provide a valid email.'],
        lowercase: true //Ensures that email addresses are always in lowercase
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'You password should consist of at least Eight characters'],
        select: false
    },
    passwordChangedAt: Date,
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        //select: false
    },
    favoriteTours: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour'
    }]
});

//DOCUMENT MIDDLEWARES
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//INSTANCE METHODS
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfterTokenWasIssued = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedPasswordTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedPasswordTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + (1000 * 60 * 10);

    return resetToken;
}

//QUERY MIDDLEWARES

userSchema.pre(/^findOne/, function (next) {
    //this.find({ active: { $ne: false } });
    this.populate({ path: 'favoriteTours' });
    next();
});


//Delete all bookings and reviews of a deleted tour
userSchema.pre(/^findOneAndDelete/, async function (next) {
    this.user = await this.findOne();
    next();
});

userSchema.post(/^findOneAndDelete/, async function () {
    await Booking.deleteMany({ user: this.user._id });
    await Review.deleteMany({ user: this.user._id });

    const unlink = promisify(fs.unlink);
    await unlink(`${__dirname}/../public/img/users/${this.user.photo}`);
});

module.exports = mongoose.model('User', userSchema);