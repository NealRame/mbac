'use strict';

/// pages/home/front.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const debug = require('debug')('mbac:routes:home');
const express = require('express');
const log_error = require('logger').error;
const mongoose = require('mongoose');
const Notification = require('pages/home/models/notification');
const path = require('path');

const router = express.Router();
const page_template = path.join(__dirname, 'views', 'front.jade');

function last_achievement(req, res, count) {
    const Achievement = mongoose.model('Achievement');
    if (Achievement != null) {
        return (Achievement.published(count)
            .then((achievements) => {
                debug(`-- Found ${achievements.length} last achievement(s)`);
                return achievements;
            })
            .catch((err) => {
                log_error(req, res, err);
                return [];
            })
        );
    }
    return Promise.resolve([]);
}

function active_notifications(req, res) {
    return (Notification.active()
        .then((notifications) => {
            debug(`-- Found ${notifications.length} active notification(s)`);
            return notifications;
        })
        .catch((err) => {
            log_error(req, res, err);
            return [];
        })
    );
}

router
    // GET achievements page.
    .get('/', (req, res) => {
        Promise.all([last_achievement(req, res, 3), active_notifications(req, res)])
            .then((result) => {
                res.locals.achievements = result[0];
                res.locals.notifications = result[1];
                res.render(page_template);
            });
    });

module.exports = {
    front: router
};
