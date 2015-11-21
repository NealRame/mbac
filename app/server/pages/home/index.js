'use strict';

/// pages/home/front.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const debug = require('debug')('mbac:routes:home');
const express = require('express');
const log_error = require('logger').error;
const mongoose = require('mongoose');
const path = require('path');


const router = express.Router();
const page_template = path.join(__dirname, 'views', 'front.jade');

function last_achievement(count) {
    const Achievement = mongoose.model('Achievement');
    return Promise.resolve(
        Achievement != null ? Achievement.published(count) : []
    );
}

router
    // GET achievements page.
    .get('/', (req, res) => last_achievement(3)
        .then((achievements) => {
            debug(`-- Found ${achievements.length} last achievement(s)`);
            res.locals.achievements = achievements;
            res.render(page_template);
        })
        .catch((err) => {
            log_error(req, res, err);
            res.locals.achievements = [];
            res.render(page_template);
        })
    );

module.exports = {
    front: router
};
