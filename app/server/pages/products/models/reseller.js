'use strict';

/*eslint-disable no-underscore-dangle*/

/// Reseller model.
/// ===============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 19 17:12:47 CET 2015

const _ = require('underscore');
const common = require('common');
const debug = require('debug')('mbac:models.Reseller');
const mongoose = require('mongoose');
const Picture = require('models/picture');
const util = require('util');

const nodify = common.async.nodify;
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

let Reseller = null;

/// ### Fields
const ResellerSchema = new Schema({
    /// #### Reseller#name
    /// Name of this achievement.
    name: {
        trim: true,
        type: String
    },
    /// #### Reseller#description
    /// Description of this achievement.
    description: String,
    /// #### Reseller#pictures
    /// A list of reference to pictures. See [models/picture](#models.picture.md)
    /// for more details.
    pictures: [{
        ref: 'Picture',
        type: ObjectId
    }],
    /// #### Reseller#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean
    },
    /// #### Reseller#address
    /// Address of the reseller.
    address: {
        required: true,
        type: String
    },
    /// #### Reseller#phone
    /// Phone number of the reseller.
    phone: String,
    /// #### Reseller#mail
    /// Mail address of the reseller.
    mail: String,
    /// #### Reseller#www
    /// Website address of the reseller.
    www: String
});

ResellerSchema.pre('remove', function(next) {
    debug(util.format('removing %s', this._id.toString()));
    this.pictures
        .map((picture) => picture._id ? picture._id : picture)
        .forEach((picture) => Picture.delete(picture));
    next();
});

/// #### `Reseller.create(data[, cb])`
/// Creates a `Reseller` instance with the given data.
///
/// **Parameters:**
/// - `data`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('create', function(data, cb) {
    debug('creating Reseller', data);
    data = data || {};
    return nodify(Picture.create(data.files || [])
        .then((pictures) => _.pluck(pictures, '_id'))
        .then((pictures) => new Reseller(
            _.chain(data)
                .pick(data, 'address', 'description', 'mail', 'name', 'phone', 'published', 'www')
                .extend({pictures})
            )
        )
        .then((reseller) => reseller.save(reseller))
        .then((reseller) =>
            _.first(reseller)
                .populate('pictures')
                .execPopulate()
        ),
        cb
    );
});

/// #### `Reseller.read(id[, cb])`
/// Returns a populated `Reseller` given its id.
///
/// **Parameters:**
/// - `id`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('read', function(id, cb) {
    debug(`read ${id}`);
    return nodify(
        Reseller
           .findById(id)
           .populate('pictures')
           .exec(),
        cb
    );
});

/// #### `Reseller.readAll([cb])`
/// Returns all `Reseller` instances.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('readAll', function(cb) {
    debug('readAll');
    return nodify(
        Reseller
            .find()
            .populate('pictures')
            .sort('-date')
            .exec(),
        cb
    );
});

/// #### `Reseller.patch(reseller, data[, cb])`
/// Patch the given `Reseller` instance, with the given data.
///
/// **Parameters:**
/// - `reseller`,
/// - `data`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('patch', function(reseller, data, cb) {
    debug(`patch ${reseller._id}`);
    return nodify(
        reseller.patch(data)
            .then(() => reseller.populate('pictures').execPopulate()),
        cb
    );
});

/// #### `Reseller.delete(reseller[, cb])`
/// Deletes the given `Reseller` instance.
///
/// **Parameters:**
/// - `reseller`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('delete', function(reseller, cb) {
    debug('delete');
    return nodify(reseller.remove(), cb);
});

/// #### `Reseller.published([limit][,cb])`
/// Returns a collection of published `Reseller` instances. Documents are
/// populated. If no limit is specified, all the `Reseller` will be
/// returned.
///
/// **Parameters:**
/// - `limit`, _optional_. The limit number of `Reseller` to be returned.
/// - `cb`, _optional_. A node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.static('published', function(count, cb) {
    if (_.isFunction(count)) {
        cb = count;
        count = 0;
    }
    return nodify(
        Reseller.find({published: true, 'pictures': {$not: {$size: 0}}})
            .limit(count)
            .populate('pictures')
            .exec(),
        cb
    );
});

/// #### `Reseller#patch(data[, cb])`
/// Patch this reseller with the given data.
///
/// **Parameters:**
/// - `data`, data to patch this `Reseller` with.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ResellerSchema.methods.patch = function(data, cb) {
    debug(`will patch ${this._id} with ${util.inspect(data)}`);
    // Only keep pictures which are referenced both in reseller pictures and
    // in data.pictures. Others pictures are removed.
    const pictures =
        _.chain(this.pictures)
            .map((picture) => picture._id ? picture._id : picture)
            .partition((id) => !_.any(data.pictures, id.equals.bind(id)))
            .tap((partition) => {
                partition[1].for_each((id) => {
                    Picture
                        .delete(id)
                        .catch((err) => debug(err));
                });
            })
            .first()
            .value();
    // Create pictures and patch the model.
    return nodify(
        Picture.create(data.files)
            .then((created_pictures) => _.pluck(created_pictures, '_id'))
            .then((created_pictures) => pictures.concat(created_pictures))
            .then((pictures) => {
                this.set(
                    _.chain(data)
                        .pick('address', 'description', 'mail', 'name', 'phone', 'published', 'www')
                        .extend({pictures})
                        .value()
                );
                return this.save();
            }),
        cb
    );
};

Reseller = module.exports = mongoose.model('Reseller', ResellerSchema);
