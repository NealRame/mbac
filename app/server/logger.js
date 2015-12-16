'use strict';

/// logger.js
/// =========
/// author: Neal.Rame. <contact@nealrame.com>
///   date: Sun Nov 22 00:25:23 CET 2015

require('winston-mongodb').MongoDB; // expose winston.transports.MongoDB

const _ = require('underscore');
const config = require('config');
const onFinished = require('on-finished');
const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.MongoDB)({
            capped: true,
            collection: 'logs',
            db: config.database.URI,
            exitOnError: false,
            level: 'info',
            password: config.database.password,
            username: config.database.user
        })
    ]
});

function format(req, data) {
    return [
        data.message,
        Object.assign(
            req != null ? { url: req.originalUrl } : {},
            _.isNumber(data.status) ? { status: data.status } : {},
            _.isString(data.stack)  ? { stack: data.stack }: {}
        )
    ];
}

function logRequestError(req, err) {
    logger.error.apply(logger, format(req, err));
}

function error(err) {
    logger.info.apply(logger, format(null, err));
}

function info(message, data) {
    logger.info(message, data);
}

module.exports = {
    middleware(req, res, next) {
        onFinished(res, (err, res) => {
            if (err) {
                logRequestError(req, res, err);
            }
        });
        next();
    },
    logRequestError,
    error,
    info
};
