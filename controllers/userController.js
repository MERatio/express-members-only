const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Model
const User = require('../models/user');

exports.createGet = (req, res) => {
	res.render('users/form', { title: 'Create User' });
};

exports.createPost = [
	// Validate and sanitise fields.
	body('firstName').trim().isLength({ max: 255 }).escape(),
	body('lastName').trim().isLength({ max: 255 }).escape(),
	body('username')
		.trim()
		.isLength({ max: 20 })
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
	body('password').isLength({ min: 8 }),
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
							res.redirect('/');
						}
					});
				}
			});
		}
	},
];
