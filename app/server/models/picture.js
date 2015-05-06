// models/Picture
// --------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mon Jan 19 22:25:36 CET 2015

var _ = require('underscore');
var common = require('common');
var debug = require('debug')('mbac:models.Picture');
var GridFs = require('gridfs');
var gm = require('gm');
var mongoose = require('mongoose');
var path = require('path');
var util = require('util');

var nodify = common.async.nodify;
var mongo = mongoose.mongo;
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
});

PictureSchema.pre('remove', function(next) {
    var gfs = new GridFs(mongoose.connection.db, mongo);
    nodify(
        Promise.all(
            _.chain(this)
                .pick('original', 'thumbnail')
                .map(function(file_id) {
                    debug(util.format('removing file %s', file_id));
                    return gfs.unlinkAsync(file_id);
                })
        ),
        next
    );
});

/// ### Methods

/// #### `Picture#originalPath()`
/// Returns the path of the original picture files.
///
/// **Return:**
/// `String`
PictureSchema.methods.originalPath = function() {
    return path.join('/', this.prefix, this.original.toString());
};

/// #### `Picture#thumbnailPath()`
/// Returns the path of the thumbnail picture files.
///
/// **Return:**
/// `String`
PictureSchema.methods.thumbnailPath = function() {
    return path.join('/', this.prefix, this.thumbnail.toString());
};

/// #### `Picture#destroy([cb])`
/// Destroy this pictures and all its associated files
///
/// **Parameters:**
/// - `cb`, _optional_, a node.js style callback.
///
/// **Return:**
/// - `Promise` if no callback is provided, `undefined` otherwise.
PictureSchema.methods.destroy = function(cb) {
    // original and thumbnail files are destroyed by pre-middleware on
    // 'remove'.
    debug('removing', this._id);
    return nodify(this.remove(), cb);
};

/// #### `Picture.create(original, [cb])`
/// Create a picture instance with the given image.
///
/// **Parameters:**
/// - `data`, the data to create the picture from. It should at least contains
///    the `original` attribute which is the original file for creating the
///    picture.
/// - `cb`, _optional_, a node.js style callback.
///
/// **Return:**
/// - `Promise` if no callback is provided, `undefined` otherwise.
PictureSchema.static('create', function(file, cb) {
    if (_.isArray(file)) {
        return nodify(Promise.all(_.map(file, Picture.create.bind(Picture))), cb);
    }
    var promise = new Promise(function(resolve, reject) {
        var gfs = new GridFs(mongoose.connection.db, mongo);
        var orig_id = _.isString(file) ? new this.mongo.ObjectId(file) : file;
        var thmb_id = new mongo.ObjectId();
        var istream = gfs.createReadStream(orig_id);
        var ostream = gfs.createWriteStream(thmb_id, {
            content_type: 'image/png'
        });
        ostream
            .once('error', reject)
            .once('end', function() {
                resolve(new Picture({
                    original: orig_id,
                    thumbnail: thmb_id,
                }));
            });
        gm(istream).resize(256).stream('png').pipe(ostream);
    });
    return nodify(promise, cb);
});

var Picture = module.exports = mongoose.model('Picture', PictureSchema);
