const url = require('url');

exports.notAuthenticatedUser = (req, res, next) => {
	if (req.user) {
		req.flash('danger', 'You are already logged in.');
		res.redirect('/');
	} else {
		next();
	}
};

exports.authenticatedUser = (req, res, next) => {
	if (!req.user) {
		req.flash('danger', 'Log in first before proceeding.');
		res.redirect(
			url.format({
				pathname: '/users/log-in',
				query: { next: req.originalUrl },
			})
		);
	} else {
		next();
	}
};

exports.notAMember = (req, res, next) => {
	if (req.user.member) {
		req.flash('danger', "You're already a member of the club.");
		res.redirect('/');
	} else {
		next();
	}
};

exports.notAnAdmin = (req, res, next) => {
	if (req.user.admin) {
		req.flash('danger', "You're already an admin.");
		res.redirect('/');
	} else {
		next();
	}
};
