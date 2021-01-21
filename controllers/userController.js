const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const url = require('url');

// Model
const User = require('../models/user');

// Lib
const beforeMiddleware = require('../lib/beforeMiddleware');

exports.createGet = [
	beforeMiddleware.notAuthenticatedUser,
	(req, res) => {
		res.render('users/form', {
			title: 'Create User',
			flashes: req.flash(),
		});
	},
];

exports.createPost = [
	beforeMiddleware.notAuthenticatedUser,
	// Validate and sanitise fields.
	body('firstName')
		.trim()
		.isLength({ max: 255 })
		.withMessage('First name is too long (maximum is 255 characters)')
		.escape(),
	body('lastName')
		.trim()
		.isLength({ max: 255 })
		.withMessage('Last name is too long (maximum is 255 characters)')
		.escape(),
	body('username')
		.trim()
		.isLength({ max: 20 })
		.withMessage('Username is too long (maximum is 20 characters)')
		.escape()
		.custom((value, { req }) => {
			return User.findOne({ username: value }).then((user) => {
				if (user) {
					throw new Error('Username already exists, pick another username');
				} else {
					// Indicates the success of this synchronous custom validator
					return true;
				}
			});
		}),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password is too short (minimum is 8 characters)'),
	body('confirmPassword').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Password confirmation does not match password');
		} else {
			return true;
		}
	}),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			res.render('users/form', {
				title: 'Create User',
				user: req.body,
				errors: errors.array(),
			});
		} else {
			// Data form is valid.
			// Create the new user with hashed password
			bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
				if (err) {
					next(err);
				} else {
					const user = new User({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						username: req.body.username,
						password: hashedPassword,
					});
					user.save((err) => {
						if (err) {
							next(err);
						} else {
							// Successful - redirect to root path.
							req.flash('success', 'You have successfully sign up.');
							res.redirect('/');
						}
					});
				}
			});
		}
	},
];

exports.logInGet = [
	beforeMiddleware.notAuthenticatedUser,
	(req, res) => {
		res.render('users/logInForm', {
			title: 'Log in',
			flashes: req.flash(),
		});
	},
];

exports.logInPost = [
	beforeMiddleware.notAuthenticatedUser,
	(req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) {
				next(err);
			} else if (!user) {
				req.flash('error', info.message);
				res.redirect(
					url.format({
						pathname: '/users/log-in',
						query: req.query,
					})
				);
			} else {
				req.logIn(user, (err) => {
					if (err) {
						next(err);
					} else {
						req.flash('success', 'Welcome!');
						res.redirect(req.query.next || '/');
					}
				});
			}
		})(req, res, next);
	},
];

exports.logOut = (req, res) => {
	if (!req.user) {
		req.flash('warning', "You're not currently logged in.");
	} else {
		req.logout();
		req.flash('success', 'You have successfully logged out.');
	}
	res.redirect('/');
};

exports.joinClubGet = [
	beforeMiddleware.authenticatedUser,
	beforeMiddleware.notAMember,
	(req, res) => {
		res.render('users/joinClubForm', {
			title: 'Join the Club',
			flashes: req.flash(),
		});
	},
];

exports.joinClubPost = [
	beforeMiddleware.authenticatedUser,
	beforeMiddleware.notAMember,
	(req, res, next) => {
		if (req.body.clubPasscode !== process.env.CLUB_PASSCODE) {
			req.flash('danger', 'Wrong club passcode, please try again.');
			res.render('users/joinClubForm', {
				title: 'Join the Club',
				flashes: req.flash(),
			});
		} else {
			req.flash('success', "You're now a member of the club!");
			User.findOneAndUpdate(
				{ _id: req.user._id },
				{ member: true },
				{},
				(err) => {
					if (err) {
						next(err);
					} else {
						res.redirect('/');
					}
				}
			);
		}
	},
];

exports.beAnAdminGet = [
	beforeMiddleware.authenticatedUser,
	beforeMiddleware.notAnAdmin,
	(req, res) => {
		res.render('users/beAnAdminForm', {
			title: 'Be an Admin',
			flashes: req.flash(),
		});
	},
];

exports.beAnAdminPost = [
	beforeMiddleware.authenticatedUser,
	beforeMiddleware.notAnAdmin,
	(req, res, next) => {
		if (req.body.adminPasscode !== process.env.ADMIN_PASSCODE) {
			req.flash('danger', 'Wrong admin passcode, please try again.');
			res.render('users/beAnAdminForm', {
				title: 'Be an Admin',
				flashes: req.flash(),
			});
		} else {
			req.flash('success', "You're now an admin of the club!");
			User.findOneAndUpdate(
				{ _id: req.user.id },
				{ member: true, admin: true },
				{},
				(err) => {
					if (err) {
						next(err);
					} else {
						res.redirect('/');
					}
				}
			);
		}
	},
];
