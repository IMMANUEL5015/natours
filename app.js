//REQUIRE PERTINENT MODULES
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const compression = require('compression');
const cors = require('cors');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

//MIDDLEWARES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Implement CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors());
/*
app.use(cors({
    'origin': 'https://www.natours.com'
}));
*/
app.options('*', cors());
//app.options('/api/v1/tours/:id', cors());

//Set Security HTTP Headers
app.use(helmet());

//Trust proxys
app.enable('trust proxy');

//Log endpoints of each request to the console
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit the number of requests that a single IP can make in an hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP address. Try again in one hour.'
});

app.use('/api', limiter);

//Pass JSON data into the req.body;
app.use(express.json({ limit: '10kb' }));

//Parse data from HTML from into the req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Parse cookies from incoming requests
app.use(cookieParser());

//Sanitize against NOSQL Query Injection
app.use(mongoSanitize());

//Sanitize against Cross site scripting attacks
app.use(xss());

//Prevent Parameter Pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

//Specify the time of a request
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//Access custom assets
app.use(express.static(path.join(__dirname, 'public')));

//Use connect flash
app.use(flash());

//req.flash requires session
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: 'I am a son of earth and starry heaven'
}));

//Compress all our text responses
app.use(compression());

//Pass variables to templates using middleware
app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//ROUTES
app.use('/api/v1/tours', /*cors(),*/ tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use(viewRouter);

//Use Moment
app.locals.moment = require('moment');

//Handling Undefined Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//The global error handling middleware
app.use(globalErrorHandler);

module.exports = app;