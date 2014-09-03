var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {type: String, unique: true},
    _initialized: {type: Boolean, default: false},
    name: {
        first: String,
        last: String
    },
    mail: String,
    picture: String
});
