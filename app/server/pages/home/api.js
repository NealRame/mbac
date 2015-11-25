'use strict';

/// pages/home/api.js
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Nov 25 22:37:16 CET 2015

const _ = require('underscore');
const debug = require('debug')('mbac:routes.notifications');
const express = require('express');
const api = require('common/api');
const path = require('path');

const Notification = require(path.join(__dirname, 'models', 'notification'));
const router = express.Router();

function read_one(req, res) {
    const id = req.params.id;
    debug('-- load notification[' + id + ']');
    return (Notification.findById(id)
        .then(api.exist)
        .then((notification) => (api.isAuthenticated(res) || notification.published)
            ? notification
            : api.error404()
        )
    );
}

function read_all(req, res) {
    const query = {};
    if (!api.isAuthenticated(res)) {
        // Unauthorized client only get published notifications.
        Object.assign(query, {
            published: true
        });
    }
    return (Notification.find(query).exec();
}

function notification_create(req, res, next) {
    return Notification.create(req.body).then(res.send.bind(res), next);
}

function notification_read(req, res, next) {
    const promise = _.isUndefined(req.params.id)
        ? read_all(req, res)
        : read_one(req, res);
    promise.then(res.send.bind(res), next);
}

function notification_update(req, res, next) {
    read_one(req, res)
        .then((notification) => notification.update(req.body).exec())
        .then(res.send.bind(res), next);
}

function notification_delete(req, res, next) {
    read_one(req, res)
        .then((notification) => notification.remove())
        .then(res.send.bind(res), next);
}

router
    .get('/notifications', notification_read)
    .get('/notifications/:id', notification_read);

router
    .use(api.authenticationChecker());

router
    .route('/notifications')
    .post(achievement_create)
    .all(api.forbidden());

router
    .route('/notifications/:id')
    .put(achievement_update)
    .delete(achievement_delete)
    .all(api.forbidden());

module.exports = router;
