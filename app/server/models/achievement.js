// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Picture = new mongoose.Schema({
    prefix: String,
    original: Schema.Types.ObjectId,
    thumbnail: Schema.Types.ObjectId
}, {_id: false});

var AchievementSchema = new Schema({
    // Date of creation of this product
    date: {
        type: Date,
        default: Date.now
    },
    // The name of this product
    name: String,
    // A short description of this product
    description: String,
    // A list of picture of this product
    pictures: [Picture],
    // Tag list for this product
    tags: [String],
    // Published flag
    published: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
