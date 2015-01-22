/// models/Achievement
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Picture = new mongoose.Schema({
    prefix: String,
    original: Schema.Types.ObjectId,
    thumbnail: Schema.Types.ObjectId
}, {_id: false});

/// ### Fields
var AchievementSchema = new Schema({
    /// #### date
    /// Date of creation of this product. Default value is `Date.now`.
    date: {
        type: Date,
        default: Date.now
    },
    /// #### name
    /// The name of this product
    name: String,
    /// #### description
    /// A short description of this product.
    description: String,
    /// #### pictures
    /// A list of picture of this product.
    pictures: [Picture],
    /// #### tags
    /// A list of tags associated to this product.
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    /// #### published
    /// Published flag.
    published: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
