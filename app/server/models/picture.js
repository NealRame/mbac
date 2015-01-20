// models/picture.js
// -----------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mon Jan 19 22:25:36 CET 2015

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/// ### Fields
var PictureSchema = new Schema({
    /// #### date
    /// Date of creation of this picture. Default value is 'Date.now'.
    date: {
        type: Date,
        default: Date.now
    },
    /// #### prefix
    /// Prepended to `original` or `thumbnail` ids to create path.
    /// Default value is 'files'.
    prefix: {
        type: String,
        default: 'files'
    },
    /// #### original
    /// _REQUIRED_. Id of the original file.
    original: {
        type: Schema.Types.ObjectId,
        required: true
    },
    /// #### thumbnail
    /// _REQUIRED_. Id of the thumbnail file.
    thumbnail: {
        type: Schema.Types.ObjectId,
        required: true
    },
    /// #### height
    /// _REQUIRED_. Height in pixels of the original picture.
    height: {
        type: Number,
        required: true
    },
    /// #### width
    /// _REQUIRED_. Width in pixels of the original picture.
    width: {
        type: Number,
        required: true
    },
});

//// #### ratio
//// _Virtual_. Ratio of width to height.
PictureSchema.virtual('ratio').get(function() {
    return this.width/this.height;
});

/// ### Methods

/// #### `Picture#originalPath()`
/// Returns the path of the original picture files.
PictureSchema.methods.originalPath = function() {
    return path.join('/', this.prefix, this.original);
}

/// #### `Picture#thumbnailPath()`
/// Returns the path of the thumbnail picture files.
PictureSchema.methods.thumbnailPath = function() {
    return path.join('/', this.prefix, this.thumbnail);
}
