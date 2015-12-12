'use strict';

/*eslint-disable no-underscore-dangle*/

/// server/pages/logs/models/log.js
/// -------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 12 18:51:30 CET 2015

// const debug = require('debug')('mbac:models.Log');
const mongoose = require('mongoose');

/// ### Fields
const LogSchema = new mongoose.Schema({
    message: {
        required: true,
        type: String
    },
    timestamp: {
        required: true,
        type: Date
    },
    level: {
        required: true,
        type: String
    },
    meta: {
        url: String,
        stack: String,
        status: Number
    }
});

module.exports = mongoose.model('Log', LogSchema);
