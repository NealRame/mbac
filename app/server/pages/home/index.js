'use strict';

/// pages/home/front.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const existy = require('common/functional').existy;
const debug = require('debug')('mbac:routes:home');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const router = express.Router();
const page_template = path.join(__dirname, 'views', 'front.jade');

function last_achievement(count) {
    return new Promise((resolve) => {
        const Achievement = mongoose.model('Achievement');
        if (existy(Achievement)) {
            resolve([]);
        } else {
            Achievement.published(count)
                .then(resolve)
                .catch(function(err) {
                    // TODO log err
                    debug(err);
                    resolve([]);
                })
        }
    });
}

router
    // GET achievements page.
    .get('/', (req, res, next) => last_achievement(3)
        .then((achievements) => {
            debug(`-- Found ${achievements.length} last achievement(s)`);
            res.locals.achievements = achievements;
            res.render(page_template);
        })
        .then(null, next)
    );

module.exports = {
    front: router
};
