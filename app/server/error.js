'use strict';

// error.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sun Jul 27 00:00:00 CEST 2014

const util = require('util');

function DBError(message) {
    if (this instanceof DBError) {
        Error.apply(this, arguments);
        this.message = message;
    } else return new DBError(message);
}
util.inherits(DBError, Error);

function DBConfigError() {
    if (this instanceof DBConfigError) {
        DBError.call(this,
            'Database configuration missing!' + '\n' +
            'Please provide a "database.conf.json" in the "config" directory.' + '\n' +
            'See "doc/config.md" for more information.'
        );
    } else return new DBConfigError();
}
util.inherits(DBConfigError, DBError);

function AppConfigError() {
    if (this instanceof AppConfigError) {
        DBError.call(this,
            'Database configuration missing!' + '\n' +
            'Please provide a "database.conf.json" in the "config" directory.' + '\n' +
            'See "doc/config.md" for more information.'
        );
    } else return new AppConfigError();
}
util.inherits(AppConfigError, Error);

exports.DBError = DBError;
exports.DBConfigError = DBConfigError;
exports.AppConfigError = AppConfigError;
