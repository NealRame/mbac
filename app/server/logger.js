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
            level: 'error',
            db: config.database.URI,
            username: config.database.user,
            password: config.database.password
        })
    ]
});

function format(req, res, data) {
    return [
        data.message,
        Object.assign(
            req != null ? { url: req.originalUrl } : {},
            _.isNumber(data.status) ? { status: data.status } : {},
            _.isString(data.stack)  ? { stack: data.stack }: {}
        )
    ];
}

module.exports = {
    middleware(req, res, next) {
        onFinished(res, (err, res) => {
            if (err) {
                logger.error.apply(logger, format(req, res, err));
            }
        });
        next();
    },
    error(req, res, err) {
        logger.error.apply(logger, format(req, res, err));
    }
};
