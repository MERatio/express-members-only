require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet');

// Require model
const User = require('./models/user');

// Require routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

const app = express();

app.use(helmet());

// Set up default mongoose connection
const mongoDB = process.env.DEV_DB_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));

// *** Passport, session config start ***
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1209600000, // 14 days in milliseconds
		},
	})
);
// The strategy is called when passport.authenticate() is called.
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, (err, user) => {
			if (err) {
				done(err);
			} else if (!user) {
				done(null, false, { message: 'Incorrect username' });
			} else {
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						// Passwords match! log user in
						done(null, user);
					} else {
						// Passwords do not match!
						done(null, false, { message: 'Incorrect password' });
					}
				});
			}
		});
	})
);
// To make sure our user is logged in
//   and to allow them to stay logged in as they move around our app.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

// For flash messages
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// *** Passport, session config end ***

// Assigns some values that is available to all views.
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.originalUrl = req.originalUrl;
	next();
});

// Use the routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
