var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = mongoose.Promise;

var PageSchema = new Schema({
    title: String,
    _id: {type: String, unique: true},
    authors: [{ type: Schema.Types.ObjectID, ref: 'User' }],
    dates: {
        creation: {
            type: Date,
            default: Date.now
        },
        modification: Date
    },
    published: {
        type: Boolean,
        default: false
    },
    index: {
        type: String,
        enum: 'top-bar footer',
    },
    rank: {
        type: Number,
        default: 0
    }
});

// Updates modification date before saving the document.
PageSchema.pre('save', function(next) {
    this.dates.modication = Date.now;
    next();
});

/// #### `Page.list([index],[callback])`
///
/// Returns a promise to be fulfilled with the pages lists.
///
/// _Parameters_:
/// * `index` [optional],
///   if specified, will only return the pages that are indexed in the given
///   index.
/// * `callback` [optional],
///   a node.js completion callback.
PageSchema.static('list', function(index, callback) {
    if (indexed) {
        return this.find({index: index, published: true})
                    .sort({rank: -1})
                    .select('title')
    }
    return this.find({}
});

/// #### `Page#slug()`
///
/// Returns the page slug (alias to _id).
PageSchema.methods.slug = function() {
    return this._id;
};

/// #### `Page#authors([options])`
///
/// Returns the list of authors
PageSchema.methods.authors = function(options, callback) {
    var promise =
        Page.popuplate(
            this, _.extend(options, {path: 'authors'})
        ).then(function(page) {
            var authors = page.authors;
            if (callback) {
                callback(null, authors);
            }
            return authors;
        }).then(null, function(err) {
            throw err;
        });

    if (callback) {
        promise.onResolve(callback);
    }

    return promise;
};

var Page = module.exports = mongoose.model('Page', PageSchema);
