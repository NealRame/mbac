/// models/Achievement
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Apr  4 13:11:09 2015

var _ = require('underscore');
var common = require('common');
var debug = require('debug')('mbac:models.Achievement');
var mongoose = require('mongoose');
var Picture = require('models/picture');
var util = require('util');

var make_promise = common.async.make_promise;
var nodify = common.async.nodify;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Promise = mongoose.Promise;
var Schema = mongoose.Schema;

/// ### Fields
var AchievementSchema = new Schema({
    /// #### Achievement#date
    /// Date of creation of this product. Default value is `Date.now`.
    date: {
        default: Date.now,
        type: Date,
    },
    /// #### Achievement#name
    /// Name of this achievement.
    name: {
        trim: true,
        type: String,
    },
    /// #### Achievement#description
    /// Description of this achievement.
    description: String,
    /// #### Achievement#pictures
    /// A list of reference to pictures. See [models/picture](#models.picture.md)
    /// for more details.
    pictures: [{
        ref: 'Picture',
        type: ObjectId,
    }],
    /// #### Achievement#tags
    /// A list of tags associated to this product.
    tags: [{
        lowercase: true,
        trim: true,
        type: String,
    }],
    /// #### Achievement#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean,
    }
});

AchievementSchema.pre('remove', function(next) {
    debug(util.format('removing %s', this._id.toString()));
    _.chain(this.pictures)
        .map(function(picture) {
            return _.has(picture, '_id') ? picture._id : picture;
        })
        .each(Picture.delete);
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
    var promise = Picture.create(data.files || [])
        .then(function(pictures) {
            return new Achievement(
                _.extend(
                    _.pick(data, 'date', 'name', 'description', 'tags', 'published'),
                    {pictures: _.pluck(pictures, '_id')}
                )
            );
        })
        .then(function(achievement) {
            return make_promise(
                achievement.save.bind(achievement)
            );
        })
        .then(function(achievements) {
            return _.first(achievements).populate('pictures').execPopulate();
        });
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
    var promise = Achievement.findById(id).exec()
        .then(function(achievement) {
            return achievement.populate('pictures').execPopulate();
        });
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
    var promise = Achievement.find().sort('-date').exec()
        .then(function(achievements) {
            return Promise.all(
                _.map(achievements)
                    .each(function(achievement) {
                        return achievement.populate('pictures').execPopulate();
                    })
            );
        });
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
    var promise = achievement.patch(data).then(function(achievement) {
        return achievement.populate('pictures').execPopulate();
    });
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

/// #### `Achievement.published([cb])`
/// Returns a collection of all published `Achievement` instances. Documents
/// are populated.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AchievementSchema.static('published', function(cb) {
    var promise = Achievement.find({published: true, 'pictures': {$not: {$size: 0}}})
        .exec()
        .then(function(collection) {
            return Achievement.populate(collection, {path: 'pictures'});
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
    var self = this;
    // Only keep pictures which are referenced both in achievement pictures and
    // in data.pictures. Others pictures are removed.
    var pictures = _.chain(this.pictures)
        .map(function(picture) {
            return _.has(picture, '_id') ? picture._id : picture;
        })
        .filter(function(id) {
            if (! _.any(data.pictures, id.equals.bind(id))) {
                Picture.delete(id).catch(function(err) {
                    debug(err); // TODO log error
                });
                return false;
            }
            return true;
        });
    // Create pictures and patch the model.
    var promise = Picture.create(data.files)
        .then(_.partial(_.pluck, _, '_id'))
        .then(Array.prototype.concat.bind(pictures))
        .then(function(pictures) {
            self.set(
                _.chain(data)
                    .pick('date', 'description', 'name', 'published', 'tags')
                    .extend({pictures: pictures})
                    .value()
            );
            return self.save();
        });
    // That's all folks see you later, bye bye !
    return nodify(promise, cb);
};

var Achievement = module.exports = mongoose.model('Achievement', AchievementSchema);
