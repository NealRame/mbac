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

/// #### `Page.list([options],[callback])`
///
/// Returns a `Promise` to be fulfilled with the list of pages.
///
/// _Parameters_:
/// * `options` _[optional]_,
///   if specified, will be used to filtered the result lists.
/// * `callback` _[optional]_,
///   a node.js completion callback.
PageSchema.static('list', function(options, callback) {
    return this.find(options)
        .sort({rank: -1})
        .select('title')
        .exec(callback);
});

/// #### `Page#authors([callback])`
///
/// Returns a `Promise` to be fulfilled with the list of authors.
///
/// _Parameters_:
/// * `callback` _[optional]_,
///   a node.js completion callback.
PageSchema.methods.authors = function(callback) {
    return Page.popuplate(
            this,
            {path: 'authors', select: 'name'},
            callback
    ).then(function(page) {
        return page.authors;
    });
};

/// #### `Page#slug()`
///
/// Returns the page slug (alias to _id).
PageSchema.methods.slug = function() {
    return this._id;
};

var Page = module.exports = mongoose.model('Page', PageSchema);
