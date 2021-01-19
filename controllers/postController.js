const beforeMiddleware = require('../lib/beforeMiddleware');

exports.createGet = [
	beforeMiddleware.authenticatedUser,
	(req, res) => {
		res.render('posts/form', { title: 'Create Post' });
	},
];

exports.createPost = (req, res, next) => {
	res.send('NOT IMPLEMENTED: Post create POST');
};
