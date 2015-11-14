'use strict';

// error.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sun Jul 27 00:00:00 CEST 2014

exports.DBConfigError = function() {
    return new Error([
        'Database configuration missing!',
        'Please provide a "database.conf.json" in the "config" directory.',
        'See "doc/config.md" for more information.'
    ].join('\n'));
};

exports.AppConfigError = function() {
    return new Error([
        'Database configuration missing!',
        'Please provide a "database.conf.json" in the "config" directory.',
        'See "doc/config.md" for more information.'
    ].join('\n'));
};
