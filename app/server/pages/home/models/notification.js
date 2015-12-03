'use strict';

/*eslint-disable no-underscore-dangle*/

/// models/Notification
/// ------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Nov 22 02:39:47 CET 2015

const debug = require('debug')('mbac:models.Notification');
const mongoose = require('mongoose');
const nodify = require('common').async.nodify;
const make_callback = require('common').async.make_callback;
const Schema = mongoose.Schema;

let Notification = null;

/// ### Fields
const NotificationSchema = new Schema({
    /// #### Notification#description
    /// Description of this Notification.
    message: String,
    /// #### Notification#published
    /// Published flag.
    published: {
        default: false,
        type: Boolean
    },
    /// #### Notification#start
    /// The start date of this `Notification`. Default value is `Date.now`.
    start: {
        default: Date.now,
        type: Number
    },
    /// #### Notification#end
    /// The date of the end of this `Notification`. If not specified, the
    /// notification never ends.
    end: {
        type: Number
    }
});

/// #### `Notification.active([cb])`
/// Returns all `Notification` instances.
///
/// **Parameters:**
/// - `cb`, a node.js style callback.
///
/// **Return:**
/// - `Promise`.
NotificationSchema.static('active', function(cb) {
    const now = Date.now() - (new Date().getTimezoneOffset()*60000);
    const promise = new Promise((resolve, reject) => {
        Notification.find({
            start: {$lte: now},
            $or: [{end: {$exists: false}}, {end: {$gte: now}}],
            published: true
        }).exec(make_callback(resolve, reject));
    });
    debug(`-- Notification.active(): current date is ${now}`);
    return nodify(promise, cb);
});

Notification = module.exports = mongoose.model('Notification', NotificationSchema);
