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

// Returns a promise of an array of pictures'ids created from the given files
function create_pictures(files, next) {
    var promise = new Promise(next);
    async.map(
        files,
        function(file, next) {
            Picture.create(file)
                .then(function(picture) {
                    next(null, picture._id);
                })
                .then(null, next);
        },
        promise.resolve.bind(promise)
    );
    return promise;
};

// Returns binded doc pictures list, call populate if the model has not been
// populated yet.
function populate_and_get_pictures(next) {
    var promise = new Promise(next);
    if (this.populated('picture')) {
        promise.fulfill(this.pictures);
    } else {
        this.populate('pictures', function(err, doc) {
            if (err) {
                promise.error(err);
            } else {
                promise.fulfill(doc.pictures);
            }
        });
    }
    return promise;
};

AchievementSchema.pre('remove', function(next) {
    debug('removing', this._id);
    populate_and_get_pictures.call(this)
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
    create_pictures(data.files)
        .then(function(pictures) {
            achievement.set('pictures', pictures).save(promise.resolve);
        })
        .then(null, promise.error);

    return promise;
});

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
            this.set(
                _.pick(
                    data, 'date', 'name', 'description', 'tags', 'published'
                )
            ).save(next);
        },
        // Create pictures task
        function(pictures, next) {
            create_pictures(data.files)
                .then(function(new_pictures) {
                    next(null, pictures.concat(new_pictures));
                })
                .then(null, next);
        },
        // Delete pictures task
        function(next) {
            _.chain(this.pictures).each(function(picture) {
                var id = picture instanceof ObjectId ? picture : picture._id;
                if (! _.any(data.pictures, id.equals.bind(id))) {
                    Picture.findByIdAndRemove(id).exec();
                }
                next(null, data.pictures);
            });
        }
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

module.exports = mongoose.model('Achievement', AchievementSchema);
