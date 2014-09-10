// config.js
// =========
// - author: Neal.Rame. <contact@nealrame.com>
// -  date: Sun Jul 27 00:00:00 CEST 2014
//
// In _production_ environement, some module settings are required and the
// application will not execute as long as the module file does not exists and
// does not provide all the required settings.
// In _development_ environment, you still can use the config file, however you
// can use environment variable or _by default_ values as well.
//
// Required modules are:
// - database
// - server

var _ = require('underscore');
var debug = require('debug')('mbac:config');
var error = require('error');
var format = require('util').format;
var fs = require('fs');
var path = require('path');

var config_dir = path.join(__dirname, '..', '..', 'config');
var config = {
    env: process.env['NODE_ENV'] || 'development'
};

/// Each `config/{MODULE}.conf.json` is a module configuration. A module must
/// follow the following pattern:
/// ```json
/// {
///   "development": {
///      ... DEV ENV SETTINGS
///   },
///   "production": {
///      ... PROD ENV SETTINGS
///   },
///   "common": {
///      ... FALLBACK AND/OR COMMON SETTINGS (USED IN BOTH CASES)
///   }
/// }
/// ```
fs.readdirSync(config_dir).forEach(function (file) {
    file = path.join(config_dir, file);
    if (path.extname(file) === '.json') {
        var module = path.basename(file, '.conf.json');
        var o = JSON.parse(fs.readFileSync(file));

        debug('loading: ' + module);
        config[module] = _.defaults(o[config.env] || {}, o.common);
    }
});

if (config.env === 'development') {
    /// ## Database module
    ///
    /// These settings are defined in the `config/database.conf.json` file.
    ///
    /// **Settings:**
    config.database = _.defaults(config.database || {}, {
        /// - `host` **REQUIRED**.
        ///   In _development_ environment:
        ///   - use the value of `DB_HOST` environment variable if defined,
        ///   - fallback to `'127.0.0.1'`
        host: process.env['DB_HOST'] || 'localhost',
        /// - `port` **REQUIRED**.
        ///   In _development_ environment:
        ///   - use the value of `DB_PORT` environment variable if defined,
        ///   - fallback to `27017`
        port: process.env['DB_PORT'] || 27017,
        /// - `name` **REQUIRED**.
        ///   In _development_ environment:
        ///   - use the value of `DB_NAME` environment variable if defined,
        ///   - fallback to `products`
        name: process.env['DB_NAME'] || 'test',
        /// - `products` **REQUIRED**.
        ///   In _development_ environment:
        ///   - use the value of `DB_USER` environment variable if defined,
        ///   - fallback to `test`
        user: process.env['DB_USER'] || 'test',
        /// - `password` **REQUIRED**.
        ///   In _development_ environment:
        ///   - use the value of `DB_PASSWORD` environment variable if defined,
        ///   - fallback to `test`
        password: process.env['DB_PASSWORD'] || 'test'
    });

    

    /// ## Server settings
    /// These settings are defined in the `config/server.conf.json` file.
    ///
    /// **Settings:**
    config.server = _.defaults(config.server || {}, {
        /// - `address` **REQUIRED**.
        ///    In _development_ environment:
        ///    - use the value of `APP_ADDRESS` environment variable if defined,
        ///    - fallback to `'127.0.0.1'`
        address: process.env['APP_ADDRESS'] || '127.0.0.1',
        /// - `port` **REQUIRED**.
        ///    In _development_ environment:
        ///    - use the value of `APP_PORT` environment variable if defined,
        ///    - fallback to `3000`
        port: process.env['APP_PORT'] || 3000
    });
}

if (! (typeof(config.database) === 'object'
        && config.database.host
        && config.database.port
        && config.database.name
        && config.database.user
        && config.database.password)) {
    throw new error.DBConfigError();
}

if (! (typeof(config.server) ===  'object'
        && config.server.address
        && config.server.port)) {
    throw new error.AppConfigError();
}

config.database.__defineGetter__('URI', function() {
    return format(
        'mongodb://%s:%d/%s',
        this.host, this.port, this.name
    );
});

config.database.__defineGetter__('fullURI', function() {
    return format(
        'mongodb://%s:%s@%s:%d/%s',
        this.user, this.password,
        this.host, this.port,
        this.name
    );
});

module.exports = config;
