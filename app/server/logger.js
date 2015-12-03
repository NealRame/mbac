'use strict';

/// logger.js
/// =========
/// author: Neal.Rame. <contact@nealrame.com>
///   date: Sun Nov 22 00:25:23 CET 2015

const config = require('config');
const onFinished = require('on-finished');
const winston = require('winston');

require('winston-mongodb').MongoDB; // expose winston.transports.MongoDB

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.MongoDB)({
            capped: true,
            level: 'error',
            db: config.database.URI,
            username: config.database.user,
            password: config.database.password
        })
    ]
});

function format(req, res, data) {
    const formatted_error = {url: req.originalUrl};
    if (data instanceof Error) {
        return Object.assign(formatted_error, {
            message: data.message,
            stack: data.stack
        });
    }
    return Object.assign(formatted_error, data);
}

module.exports = {
    middleware(req, res, next) {
        onFinished(res, (err, res) => {
            if (err) {
                logger.error('', format(req, res, err));
            } else {
                logger.info('', format(req, res, err));
            }
        });
        next();
    },
    error(req, res, err) {
        logger.error('', format(req, res, err));
    }
};
