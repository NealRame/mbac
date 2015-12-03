'use strict';

/*eslint-disable no-underscore-dangle*/

/// models/Achievement
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Apr  4 13:11:09 2015

const _ = require('underscore');
const common = require('common');
const debug = require('debug')('mbac:models.Achievement');
const mongoose = require('mongoose');
const Picture = require('models/picture');
const util = require('util');

const make_promise = common.async.make_promise;
const nodify = common.async.nodify;
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

let Achievement = null;

/// ### Fields
const AchievementSchema = new Schema({
    /// #### Achievement#date
    /// Date of creation of this product. Default value is `Date.now`.
    date: {
        default: Date.now,
        type: Date
    },
    /// #### Achievement#name
    /// Name of this achievement.
    name: {
        trim: true,
        type: String
    },
    /// #### Achievement#description
    /// Description of this achievement.
    description: String,
    /// #### Achievement#pictures
    /// A list of reference to pictures. See [models/picture](#models.picture.md)
    /// for more details.
    pictures: [{
        ref: 'Picture',
        type: ObjectId
    }],
    /// #### Achievement#tags
    /// A list of tags associated to this product.
    tags: [{
        lowercase: true,
        trim: true,
        type: String
    }],
    /// #### Achievement#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean
    }
});

AchievementSchema.pre('remove', function(next) {
    debug(util.format('removing %s', this._id.toString()));
    this.pictures
        .map((picture) => picture._id ? picture._id : picture)
        .forEach((picture) => Picture.delete(picture));
    next();
});

/// #### `Achievement.create(data[, cb])`
/// Creates an `Achievement` instance with the given data.
///
/// **Parameters:**
/// - `data`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('create', function(data, cb) {
    debug('creating Achievement', data);
    data = data || {};
    const promise = Picture.create(data.files || [])
        .then((pictures) => new Achievement(
            _.extend(
                _.pick(data, 'date', 'name', 'description', 'tags', 'published'),
                {pictures: _.pluck(pictures, '_id')}
            )
        ))
        .then((achievement) => make_promise(achievement.save.bind(achievement)))
        .then((achievements) => _.first(achievements).populate('pictures').execPopulate());
    return nodify(promise, cb);
});

/// #### `Achievement.read(id[, cb])`
/// Returns an `Achievement` given its id.
///
/// **Parameters:**
/// - `id`.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('read', function(id, cb) {
    debug('read');
    const promise = Achievement.findById(id).exec()
        .then((achievement) => achievement.populate('pictures').execPopulate());
    return nodify(promise, cb);
});

/// #### `Achievement.readAll([cb])`
/// Returns all `Achievement` instances.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('readAll', function(cb) {
    debug('readAll');
    const promise = Achievement.find().sort('-date').exec()
        .then((achievements) => Promise.all(
            achievements.map((achievement) => achievement.populate('pictures').execPopulate())
        ));
    return nodify(promise, cb);
});

/// #### `Achievement.patch(achievement, data[, cb])`
/// Patch the given `Achievement` instance, with the given data.
///
/// **Parameters:**
/// - `achievement`,
/// - `data`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('patch', function(achievement, data, cb) {
    debug('patch');
    const promise = achievement.patch(data)
        .then(() => achievement.populate('pictures').execPopulate());
    return nodify(promise, cb);
});

/// #### `Achievement.delete(achievement[, cb])`
/// Deletes the given `Achievement` instance.
///
/// **Parameters:**
/// - `achievement`,
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('delete', function(achievement, cb) {
    debug('delete');
    return nodify(achievement.remove(), cb);
});

/// #### `Achievement.published([limit][,cb])`
/// Returns a collection of published `Achievement` instances. Documents are
/// populated. If no limit is specified, all the `Achievement` will be
/// returned.
///
/// **Parameters:**
/// - `limit`, _optional_. The limit number of `Achievement` to be returned.
/// - `cb`, _optional_. A node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('published', function(count, cb) {
    if (_.isFunction(count)) {
        cb = count;
        count = null;
    }
    const promise = new Promise((resolve, reject) => {
        Achievement.find({published: true, 'pictures': {$not: {$size: 0}}})
            .sort('-date')
            .limit(count || 0)
            .exec()
            .then((collection) => Achievement.populate(collection, {path: 'pictures'}))
            .then(resolve, reject);
    });
    return nodify(promise, cb);
});

/// #### `Achievement#patch(data[, cb])`
/// Patch this achievement with the given data.
///
/// **Parameters:**
/// - `data`, data to patch this `Achievement` with.
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.methods.patch = function(data, cb) {
    debug(util.format('patching %s with %s', this._id, util.inspect(data)));
    // Only keep pictures which are referenced both in achievement pictures and
    // in data.pictures. Others pictures are removed.
    const pictures = this.pictures
        .map((picture) => picture._id ? picture._id : picture)
        .filter((id) => {
            if (!_.any(data.pictures, id.equals.bind(id))) {
                Picture.delete(id).catch((err) => debug(err)); // TODO log error
                return false;
            }
            return true;
        });
    // Create pictures and patch the model.
    const promise = Picture.create(data.files)
        .then(_.partial(_.pluck, _, '_id'))
        .then(Array.prototype.concat.bind(pictures))
        .then((achievement_pictures) => {
            this.set(
                _.chain(data)
                    .pick('date', 'description', 'name', 'published', 'tags')
                    .extend({pictures: achievement_pictures})
                    .value()
            );
            return this.save();
        });
    // That's all folks see you later, bye bye !
    return nodify(promise, cb);
};

Achievement = module.exports = mongoose.model('Achievement', AchievementSchema);
