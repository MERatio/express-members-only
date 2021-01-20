const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	firstName: { type: String, required: true, maxlength: 255 },
	lastName: { type: String, required: true, maxlength: 255 },
	username: {
		type: String,
		required: true,
		maxlength: 20,
		index: true,
		unique: true,
	},
	password: { type: String, required: true },
	member: { type: Boolean, default: false },
});

// Virtual
UserSchema.virtual('fullName').get(function () {
	return this.firstName + ' ' + this.lastName;
});

module.exports = mongoose.model('User', UserSchema);
