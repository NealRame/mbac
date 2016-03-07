'use strict';

/* eslint-disable no-underscore-dangle */

/// config.js
/// =========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date: Sun Jul 27 00:00:00 CEST 2014
///
/// In _production_ environement, some module settings are required and the
/// application will not execute as long as the module file does not exists and
/// does not provide all the required settings.
/// In _development_ environment, you still can use the config file, however you
/// can use environment variable or _by default_ values as well.
///
/// Required modules are:
/// - database
/// - server

const _ = require('underscore');
const debug = require('debug')('mbac:config');
const fs = require('fs');
const path = require('path');

const db_config_error_message = [
    'Database configuration missing!',
    'Please provide a "database.conf.json" in the "config" directory.',
    'See "doc/config.md" for more information.'
].join('\n');
const app_config_error = [
    'Database configuration missing!',
    'Please provide a "database.conf.json" in the "config" directory.',
    'See "doc/config.md" for more information.'
].join('\n');

const config_dir = path.join(__dirname, '..', '..', 'config');
const config = {
    env: process.env.NODE_ENV || 'development'
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
        const module = path.basename(file, '.conf.json');
        const o = JSON.parse(fs.readFileSync(file));

        debug('loading: ' + module);
        config[module] = _.defaults(o[config.env] || {}, o.common);
    }
});

/// ## Database module
///
/// These settings are defined in the `config/database.conf.json` file.
///
/// **Settings:**
config.database = Object.assign(
    config.database || {},
    /// - `host` **REQUIRED**.
    ///   Use the value of `DB_HOST` environment variable if defined.
    process.env.DB_HOST ? {host: process.env.DB_HOST} : {},
    /// - `port` **REQUIRED**.
    ///   Use the value of `DB_PORT` environment variable if defined.
    process.env.DB_PORT ? {host: process.env.DB_PORT} : {},
    /// - `name` **REQUIRED**.
    ///   Use the value of `DB_NAME` environment variable if defined.
    process.env.DB_NAME ? {name: process.env.DB_NAME} : {},
    /// - `user` **REQUIRED**.
    /// Use the value of `DB_USER` environment variable if defined.
    process.env.DB_USER ? {user: process.env.DB_USER} : {},
    /// - `password` **REQUIRED**.
    /// Use the value of `DB_PASSWORD` environment variable if defined.
    process.env.DB_PASSWORD ? {password: process.env.DB_PASSWORD} : {}
);

if (config.env === 'development') {
    /// In _development_ environment `config.database` atributes fallback to
    /// these values if no configuration file or environment variables are set.
    config.database = _.defaults(config.database || {}, {
        /// - `config.database.host: 'localhost'
        host: 'localhost',
        /// - `config.database.port: 270117`
        port: 27017,
        /// - `config.database.name: 'test'`
        name: 'test',
        /// - `config.database.user: 'test'`
        user: 'test',
        /// - `config.database.password: 'test'`
        password: 'test'
    });
}

/// ## Server settings
/// These settings are defined in the `config/server.conf.json` file.
///
/// **Settings:**
config.server = Object.assign(
    config.server || {},
    /// - `address` **REQUIRED**.
    ///   Use the value of `APP_ADDRESS` environment variable if defined.
    process.env.APP_ADDRESS ? {address: process.env.APP_ADDRESS} : {},
    /// - `port` **REQUIRED**.
    ///    Use the value of `APP_PORT` environment variable if defined.
    process.env.APP_PORT ? {port: process.env.APP_PORT} : {}
);

if (config.env === 'development') {
    /// In _development_ environment `config.server` atributes fallback to
    /// these values if no configuration file or environment variables are set.
    config.server = _.defaults(config.server || {}, {
        /// - `config.server.address`
        address: '127.0.0.1',
        /// - `config.server.port`
        port: 3000
    });
}

if (!(typeof config.database === 'object'
        && config.database.host
        && config.database.port
        && config.database.name
        && config.database.user
        && config.database.password)) {
    throw new Error(db_config_error_message);
}

if (!(typeof config.server === 'object'
        && config.server.address
        && config.server.port)) {
    throw new Error(app_config_error);
}

Object.defineProperty(config.database, 'URI', {
    enumerable: true,
    get: function() {
        return `mongodb://${this.host}:${this.port}/${this.name}`;
    }
});

Object.defineProperty(config.database, 'fullURI', {
    enumerable: true,
    get: function() {
        return `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.name}`;
    }
});

module.exports = config;
