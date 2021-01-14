exports.createGet = (req, res) => {
	res.render('users/form', { title: 'Create User' });
};

exports.createPost = (req, res, next) => {
	res.send('NOT IMPLEMENTED: User create POST');
};
