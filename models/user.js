const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	firstName: { type: String, required: true, maxlength: 255 },
	lastName: { type: String, required: true, maxlength: 255 },
	username: { type: String, required: true, maxlength: 20 },
	password: { type: String, required: true },
	member: { type: Boolean, required: true },
});

module.exports = mongoose.model('User', UserSchema);
