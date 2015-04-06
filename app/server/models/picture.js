// models/Picture
// --------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mon Jan 19 22:25:36 CET 2015

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('mbac:models.Picture');
var GridFs = require('gridfs-stream');
var gm = require('gm');
var inspect = require('util').inspect;
var mongoose = require('mongoose');
var mongo = mongoose.mongo;
var path = require('path');
var Promise = mongoose.Promise;
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

PictureSchema.pre('remove', function(next) {
    var gfs = GridFs(mongoose.connection.db, mongo);
    async.each(
        _.chain(this).pick('original', 'thumbnail').values().value(),
        function(id, next) {
            debug('removing file', id);
            gfs.remove({_id: id.toString()}, function(err) {
                if (err) {
                    debug(err);
                }
                next();
            });
        },
        next
    );
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
    return path.join('/', this.prefix, this.original.toString());
};

/// #### `Picture#thumbnailPath()`
/// Returns the path of the thumbnail picture files.
PictureSchema.methods.thumbnailPath = function() {
    return path.join('/', this.prefix, this.thumbnail.toString());
};

/// #### `Picture#destroy([cb])`
/// Destroy this pictures and all its associated files
///
/// __Parameters:__
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
PictureSchema.methods.destroy = function(cb) {
    // original and thumbnail files are destroyed by pre-middleware on
    // 'remove'.
    debug('removing', this._id);
    var promise = new Promise(cb);
    this.remove(promise.resolve.bind(promise));
    return promise;
};

// Returns a promise of an array of pictures'ids created from the given files
function create_pictures(datas, cb) {
    var promise = new Promise(cb);
    async.map(
        datas,
        Picture.create.bind(Picture),
        promise.resolve.bind(promise)
    );
    return promise;
}

/// #### `Picture.create(original, [cb])`
/// Create a picture instance with the given image.
///
/// __Parameters:__
/// - `data`, the data to create the picture from. It should at least contains
///    the `original` attribute which is the original file for creating the
///    picture.
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
PictureSchema.static('create', function(data, cb) {
    if (_.isArray(data)) {
        return create_pictures(data, cb);
    }

    var promise = new Promise(cb);
    var gfs = GridFs(mongoose.connection.db, mongo);

    gm(gfs.createReadStream({_id: data.original}))
        .size({bufferStream: true}, function(err, size) {
            if (err) {
                return promise.error(err);
            }

            var thumbnail_id = new mongo.ObjectID();
            var ostream = gfs.createWriteStream({
                _id: thumbnail_id,
                content_type: 'image/png',
                metadata: {original: data.original},
                mode: 'w',
            });

            _.bindAll(promise, 'resolve', 'error');
            _.extend(data, {thumbnail: thumbnail_id}, size);
            ostream
                .once('error', function(err) {
                    gfs.remove({_id: thumbnail_id.toString()});
                    promise.error(err);
                })
                .once('close', function() {
                    (new Picture(data)).save(promise.resolve);
                });

            this.resize(256).stream().pipe(ostream);
        });

    return promise;
});



var Picture = module.exports = mongoose.model('Picture', PictureSchema);
