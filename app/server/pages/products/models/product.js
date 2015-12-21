'use strict';

/*eslint-disable no-underscore-dangle*/

/// Product model.
/// ==============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 19 18:31:33 CET 2015

const _ = require('underscore');
const common = require('common');
const debug = require('debug')('mbac:models.Product');
const mongoose = require('mongoose');
const Picture = require('models/picture');
const util = require('util');

const nodify = common.async.nodify;
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

let Product = null;

/// ### Fields
const ProductSchema = new Schema({
    /// #### Reseller#date
    /// Date of creation of this product. Default value is `Date.now`.
    date: {
        default: Date.now,
        type: Date
    },
    /// #### Product#name
    /// Name of this achievement.
    name: {
        trim: true,
        type: String
    },
    /// #### Product#description
    /// Description of this achievement.
    description: String,
    /// #### Product#pictures
    /// A list of reference to pictures. See [models/picture](#models.picture.md)
    /// for more details.
    pictures: [{
        ref: 'Picture',
        type: ObjectId
    }],
    /// #### Product#resellers
    /// A list of resellers ids.
    resellers: [{
        ref: 'Reseller',
        type: ObjectId
    }],
    /// #### Product#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean
    },
    /// #### Product#price
    /// Price of the product.
    price: {
        default: 0,
        type: Number
    },
    /// #### Product#tags
    /// A list of tags associated to this product.
    tags: [{
        lowercase: true,
        trim: true,
        type: String
    }]
});

ProductSchema.pre('remove', function(next) {
    debug('removing Product ${this._id.toString()}')
    this.pictures
        .map((picture) => picture._id ? picture._id : picture)
        .forEach((picture) => Picture.delete(picture));
    next();
});

/// #### `Product.create(data[, cb])`
/// Creates a `Product` instance with the given data.
///
/// **Parameters:**
/// - `data`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('create', function(data, cb) {
    debug('creating Product', data);
    data = data || {};
    return nodify(Picture.create(data.files || [])
        .then((pictures) => _.pluck(pictures, '_id'))
        .then((pictures) => new Product(
            _.chain(data)
                .pick('date', 'description', 'name', 'price', 'published', 'resellers', 'tags')
                .extend({pictures})
                .value()
            )
        )
        .then((product) => product.save())
        .then((product) =>
            product
                .populate('pictures')
                .populate('resellers')
                .execPopulate()
        ),
        cb
    );
});

/// #### `Product.read(id[, cb])`
/// Returns a populated `Product` given its id.
///
/// **Parameters:**
/// - `id`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('read', function(id, cb) {
    debug(`read ${id}`);
    return nodify(
        Product
           .findById(id)
           .populate('pictures')
           .populate('resellers')
           .exec(),
        cb
    );
});

/// #### `Product.readAll([cb])`
/// Returns all `Product` instances.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('readAll', function(cb) {
    debug('readAll');
    return nodify(
        Product
            .find()
            .populate('pictures')
            .populate('resellers')
            .sort('-date')
            .exec(),
        cb
    );
});

/// #### `Product.patch(product, data[, cb])`
/// Patch the given `Product` instance, with the given data.
///
/// **Parameters:**
/// - `product`,
/// - `data`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('patch', function(product, data, cb) {
    debug(`patch ${product._id}`);
    return nodify(
        product.patch(data)
            .then(() =>
                product
                    .populate('pictures')
                    .populate('resellers')
                    .execPopulate()
            ),
        cb
    );
});

/// #### `Product.delete(product[, cb])`
/// Deletes the given `Product` instance.
///
/// **Parameters:**
/// - `product`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('delete', function(reseller, cb) {
    debug(`delete ${reseller._id}`);
    return nodify(reseller.remove(), cb);
});

/// #### `Product.published([limit][,cb])`
/// Returns a collection of published `Product` instances. Documents are
/// populated. If no limit is specified, all the `Product` will be
/// returned.
///
/// **Parameters:**
/// - `limit`, _optional_. The limit number of `Product` to be returned.
/// - `cb`, _optional_. A node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.static('published', function(count, cb) {
    if (_.isFunction(count)) {
        cb = count;
        count = 0;
    }
    return nodify(
        Product.find({published: true, 'pictures': {$not: {$size: 0}}})
            .limit(count)
            .populate('pictures')
            .populate('resellers')
            .exec(),
        cb
    );
});

/// #### `Product#patch(data[, cb])`
/// Patch this product with the given data.
///
/// **Parameters:**
/// - `data`, data to patch this `Product` with.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
ProductSchema.methods.patch = function(data, cb) {
    debug(`patch Product ${this._id} with ${util.inspect(data)}`);
    // Only keep pictures which are referenced both in product pictures and
    // in data.pictures. Others pictures are removed.
    const pictures =
        _.chain(this.pictures)
            .map((picture) => picture._id ? picture._id : picture)
            .partition((id) => _.some(data.pictures, id.equals.bind(id)))
            .tap((partition) => {
                partition[1].forEach((id) =>
                    Picture
                        .delete(id)
                        .catch((err) => debug(err));
                );
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
                        .pick('date', 'description', 'name', 'price', 'published', 'resellers', 'tags')
                        .extend({pictures})
                        .value()
                );
                return this.save();
            }),
        cb
    );
};

Product = module.exports = mongoose.model('Product', ProductSchema);
