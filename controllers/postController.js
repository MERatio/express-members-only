const { body, validationResult } = require('express-validator');
const formatDistance = require('date-fns/formatDistance');

// Model
const Post = require('../models/post');

// Lib
const beforeMiddleware = require('../lib/beforeMiddleware');

exports.list = (req, res, next) => {
	Post.find()
		.populate('user')
		.exec((err, posts) => {
			if (err) {
				next(err);
			} else {
				//Successful, so render
				res.render('posts/list', {
					title: 'Posts',
					flashes: req.flash(),
					posts,
					formatDistance,
				});
			}
		});
};

exports.createGet = [
	beforeMiddleware.authenticatedUser,
	(req, res) => {
		res.render('posts/form', { title: 'Create Post', flashes: req.flash() });
	},
];

exports.createPost = [
	beforeMiddleware.authenticatedUser,
	// Validate and sanitise fields.
	body('title')
		.trim()
		.isLength({ max: 60 })
		.withMessage('Title is too long (maximum is 60 characters)')
		.escape(),
	body('body')
		.trim()
		.isLength({ max: 1000 })
		.withMessage('Body is too long (maximum is 1000 characters)')
		.escape(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			res.render('posts/form', {
				title: 'Create Post',
				user: req.body,
				errors: errors.array(),
			});
		} else {
			// Data form is valid.
			// Create an Post object with escaped and trimmed data.
			const post = new Post({
				user: req.user._id,
				title: req.body.title,
				body: req.body.body,
			});
			post.save((err) => {
				// Successful - redirect to root path.
				req.flash('success', 'You have successfully create a new message.');
				res.redirect('/');
			});
		}
	},
];
