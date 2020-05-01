const AppError = require('../../utils/appError');

const handleJwtError = () => new AppError('An error occured. Please login again.', 401);
const handleTokenExpiredError = () => new AppError('You have been logged out of the application. Please login again.', 401)

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    const message = `(${value}) is already in use. Please use something else.`;
    return new AppError(message, 400);
}

const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid Input Data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        // console.log(err.message);
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    //Rendered website
    return res.status(err.statusCode).render('error', {
        title: 'Something went very wrong!',
        msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        //Operational errors - Send details of trusted error
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        //Programming errors - Don't leak error details to client
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    //Rendered Website
    if (err.isOperational) {
        //Operational errors - Send details of trusted error
        return res.status(err.statusCode).render('error', {
            title: 'Something went very wrong!',
            msg: err.message
        });
    }
    //Programming errors - Don't leak error details to client
    return res.status(500).render('error', {
        title: 'Something went very wrong!',
        msg: 'Please Try Again Later.'
    });
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') error = handleJwtError();
        if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

        sendErrorProd(error, req, res);
    }
};