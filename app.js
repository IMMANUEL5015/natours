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
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const tourRouter = require('./routes/api/tourRoutes');
const userRouter = require('./routes/api/userRoutes');
const bookingRouter = require('./routes/api/bookingRoutes');
const userViewsRouter = require('./routes/views/userRoutes');
const bookingViewsRouter = require('./routes/views/bookingRoutes');
const reviewsViewsRouter = require('./routes/views/reviewsRoutes');
const tourViewsRouter = require('./routes/views/tourRoutes');
const bookingController = require('./controllers/api/bookingController');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/api/errorController');
const app = express();

//MIDDLEWARES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Implement CORS
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

//Create a new booking when a user books a tour
app.post('/webhook-checkout',
    bodyParser.raw({ type: 'application/json' }),
    bookingController.webhookCheckout);

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

//req.flash requires session
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: 'I am a son of earth and starry heaven'
}));

//Compress all our text responses
app.use(compression());

//ROUTES
app.use('/api/v1/tours', /*cors(),*/ tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use(tourViewsRouter);
app.use(userViewsRouter);
app.use(bookingViewsRouter);
app.use(reviewsViewsRouter);

//Use Moment
app.locals.moment = require('moment');

//Handling Undefined Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//The global error handling middleware
app.use(globalErrorHandler);

module.exports = app;