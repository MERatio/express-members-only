exports.notAuthenticatedUser = (req, res, next) => {
	if (req.user) {
		req.flash('danger', 'You are already logged in.');
		res.redirect('/');
	} else {
		next();
	}
};

exports.authenticatedUser = (req, res, next) => {
	console.log(req.user);
	if (!req.user) {
		req.flash('danger', 'Log in first before proceeding.');
		res.redirect('/users/sign-up');
	} else {
		next();
	}
};
