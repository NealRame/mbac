'use strict';

/*eslint-disable no-underscore-dangle*/

/// models/Alert
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Nov 22 02:39:47 CET 2015

const mongoose = require('mongoose');
const nodify = require('common').async.nodify;
const Schema = mongoose.Schema;

let Alert = null;

/// ### Fields
const AlertSchema = new Schema({
    /// #### Alert#start
    /// The start date of this `Alert`. Default value is `Date.now`.
    start: {
        default: Date.now,
        type: Date
    },
    /// #### Alert#end
    /// The date of the end of this `Alert`. If not specified, the alert never
    /// ends.
    end: {
        type: Date
    },
    /// #### Alert#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean
    },
    /// #### Alert#description
    /// Description of this Alert.
    description: String
});

/// #### `Alert.active([cb])`
/// Returns all `Alert` instances.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
AlertSchema.static('active', function(cb) {
    const now = Date.now();
    const promise = Alert.find({
        start: {$lte: now},
        end: {$or: [{$exists: false}, {$gte: now}]},
        published: true
    }).exec();
    return nodify(promise, cb);
});

Alert = module.exports = mongoose.model('Alert', AlertSchema);
