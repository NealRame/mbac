/// models/Achievement
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('mbac:models.Achievement');
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;
var Picture = require('models/picture');
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
    debug('removing', this._id);
    this.getPictures()
        .then(function(pictures) {
            async.each(
                pictures,
                function(picture, next) {
                    picture.destroy().addBack(next)
                },
                next
            );
        })
        .then(null, next);
});

/// #### `Achievement.create(data, [cb])`
/// Create an `Achievement` instance with the given data.
///
/// __Parameters:__
/// - `data`.
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
AchievementSchema.static('create', function(data, cb) {
    var Model = this;
    var achievement = new Model(_.pick(data, 'date', 'name', 'description', 'tags', 'published'));
    var promise = new Promise(cb);

    debug('creating Achievement', data);
    _.bindAll(promise, 'resolve', 'error');
    Picture.create(data.files)
        .then(function(pictures) {
            achievement.set('pictures', pictures).save(promise.resolve);
        })
        .then(null, promise.error);

    return promise;
});

/// #### `Achievement#populate([cb])`
/// Populate this achievement..
///
/// __Parameters:__
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
AchievementSchema.methods.populate = function(cb) {
    debug('populate');
    var promise = new Promise(cb);
    _.bindAll(promise, 'fulfill', 'error');
    Achievement.populate(this, {path: 'pictures'})
        .then(promise.fulfill)
        .then(null, promise.error);
    return promise;
};

/// #### `Achievement#getPictures([cb])`
/// Return an array of pictures document.
///
/// __Parameters:__
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
AchievementSchema.methods.getPictures = function(cb) {
    debug('getPictures');
    var promise = new Promise(cb);
    _.bindAll(promise, 'fulfill', 'error');
    this.populate()
        .then(function(doc) {
            return doc.pictures;
        })
        .then(promise.fulfill)
        .then(null, promise.error)
    return promise;
}

/// #### `Achievement#patch(data, [cb])`
/// Patch this achievement with the given data.
///
/// __Parameters:__
/// - `data`, data to patch this `Achievement` with.
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
AchievementSchema.methods.patch = function(data, cb) {
    var promise = new Promise(cb);

    debug('patching', this._id);
    async.compose(
        // Patch model task
        function(pictures, next) {
            debug('patching task');
            this.set(
                _.chain(data)
                    .pick('date', 'name', 'description', 'tags', 'published')
                    .extend({pictures: pictures})
                    .value()
            ).save(next);
        },
        // Create pictures task
        function(pictures, next) {
            debug('create task');
            create_pictures(data.files)
                .then(Array.prototype.concat.bind(pictures))
                .then(next.bind(null, null))
                .then(null, next);
        },
        // Delete pictures which are not both referenced in pictures and in
        // `data.pictures`, immediately pass back original file list to create
        // new pictures to the create task.
        function(pictures, next) {
            debug('delete task');
            _.chain(pictures).pluck('_id').each(function(id) {
                if (! _.any(data.pictures, id.equals.bind(id))) {
                    Picture.findById(id).exec()
                        .then(function(doc) {
                            if (doc) {
                                doc.destroy()
                            }
                        })
                        .then(null, function(err) {
                            console.log(err);
                        })
                }
            });
            next(null, data.pictures);
        },
        // Populate pictures and pass it back to delete task
        this.getPictures
    ).call(this, promise.resolve.bind(promise));

    return promise;
};

/// #### `Achievement#destroy([cb])`
/// Destroy this `Achievement` and all its pictures.
///
/// __Parameters:__
/// - `cb`, a node.js style callback.
///
/// __Returns:__
/// - `Promise`.
AchievementSchema.methods.destroy = function(cb) {
    // pictures are destroyed by pre-middleware on 'remove'.
    var promise = new Promise(cb);
    this.remove(promise.resolve.bind(promise));
    return promise;
};

var Achievement = module.exports = mongoose.model('Achievement', AchievementSchema);
