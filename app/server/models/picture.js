'use strict';

/* eslint-disable no-underscore-dangle*/

/// models/Picture
/// --------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Jan 19 22:25:36 CET 2015

const _ = require('underscore');
const async = require('async');
const common = require('common');
const debug = require('debug')('mbac:models.Picture');
const GridFs = require('gridfs');
const gm = require('gm');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const path = require('path');
const util = require('util');

const make_callback = common.async.make_callback;
const nodify = common.async.nodify;
const Schema = mongoose.Schema;

let Picture = null;

/// ### Fields

const PictureSchema = new Schema({
    /// #### `Picture#date`
    /// Date of creation of this picture. Default value is 'Date.now'.
    date: {
        type: Date,
        default: Date.now
    },
    /// #### `Picture#prefix`
    /// Prepended to `original` or `thumbnail` ids to create path.
    /// _Read only_. Default value is 'files'.
    prefix: {
        type: String,
        default: 'files',
        set: function(val) {
            return this.prefix || val;
        }
    },
    /// #### `Picture#original`
    /// _REQUIRED_, _read only_. Id of the original file.
    original: {
        type: Schema.Types.ObjectId,
        required: true,
        set: function(val) {
            return this.original || val;
        }
    },
    /// #### `Picture#thumbnail`
    /// _REQUIRED_, _read only_. Id of the thumbnail file.
    thumbnail: {
        type: Schema.Types.ObjectId,
        required: true,
        set: function(val) {
            return this.thumbnail || val;
        }
    }
});

PictureSchema.pre('remove', function(next) {
    debug(util.format('removing %s', this._id.toString()));
    const gfs = new GridFs(mongo, mongoose.connection.db);
    _.chain(this)
        .pick('original', 'thumbnail')
        .each(function(file_id) {
            gfs.unlinkAsync(file_id).catch(function(err) {
                debug(err); // TODO log error
            });
        });
    next();
});

/// ### Methods

/// #### `Picture.create(original[, cb])`
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
    debug(util.format('create picture with %s', util.inspect(file)));
    if (_.isArray(file)) {
        return nodify(new Promise((resolve, reject) => {
            async.mapSeries(file, Picture.create, make_callback(resolve, reject));
        }), cb);
    }
    const promise = new Promise((resolve, reject) => {
        const gfs = new GridFs(mongo, mongoose.connection.db);
        const orig_id = _.isString(file) ? new mongo.ObjectId(file) : file;
        const thmb_id = new mongo.ObjectId();
        const istream = gfs.createReadStream(orig_id);
        const ostream = gfs.createWriteStream(thmb_id, {
            content_type: 'image/png'
        });
        ostream
            .once('error', reject)
            .once('end', function() {
                debug('end of thumbnail', thmb_id);
                gfs.closeAsync(ostream.gs)
                    .then(function() {
                        const picture = new Picture({
                            original: orig_id,
                            thumbnail: thmb_id
                        });
                        return picture.save();
                    })
                    .then(resolve)
                    .catch(reject);
            });
        gm(istream).resize(256).stream('png').pipe(ostream);
    });
    return nodify(promise, cb);
});

/// #### `Picture.read([id][, cb])`
/// Return a picture given its id. Return all pictures if no id is provided.
///
/// **Parameters:**
/// - `id`, _optional_, an `ObjectId`.
/// - `cb`, _optional_, a node.js style callback.
///
/// **Return:**
/// - `Promise` if no callback is provided, `undefined` otherwise.
PictureSchema.static('read', (id, cb) => {
    if (_.isFunction(id)) {
        cb = id;
        id = null;
    }
    const promise = new Promise((resolve, reject) => {
        (_.isNull(id) ? Picture.find() : Picture.findById(id))
            .exec(make_callback(resolve, reject));
    });
    return nodify(promise, cb);
});

/// #### `Picture.delete(id[, cb])`
/// Remove pictures given their id.
///
/// **Parameters:**
/// - `id`, an `ObjectId` or an `Array` of `ObjectId`.
/// - `cb`, _optional_, a node.js style callback.
///
/// **Return:**
/// - `Promise` if no callback is provided, `undefined` otherwise.
PictureSchema.static('delete', (id, cb) => {
    if (_.isArray(id)) {
        return nodify(Promise.all(_.map(id, Picture.delete)), cb);
    }
    const promise = Picture.read(id).then((picture) => {
        if (picture) {
            return new Promise((resolve, reject) => {
                picture.remove(make_callback(resolve, reject));
            });
        }
        return Promise.resolve();
    });
    return nodify(promise, cb);
});

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

Picture = module.exports = mongoose.model('Picture', PictureSchema);
