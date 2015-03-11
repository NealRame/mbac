var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {type: String, unique: true},
    name: {
        first: String,
        last: String
    },
    email: String,
    picture: String
});

UserSchema.methods.isInitialized = function() {
    return _.has(this, 'email') && _.has(this, 'name') && _.has(this, 'picture');
};

UserSchema.virtual('name.full').get(function() {
    return this.name.first + ' ' + this.name.last;
});

module.exports = mongoose.model('User', UserSchema);
