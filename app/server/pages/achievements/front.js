'use strict';

/// front.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date:  Fri Apr  3 01:05:57 2015

const debug = require('debug')('mbac:routes:achievements');
const express = require('express');
const path = require('path');
const util = require('util');

const Achievement = require(path.join(__dirname, 'models', 'achievement'));
const router = express.Router();

const list_template = path.join(__dirname, 'views', 'achievements.jade');
const page_template = path.join(__dirname, 'views', 'achievement.jade');

router
    // GET achievements page.
    .get('/', (req, res, next) => {
        res.locals.page.application = path.join('pages/achievements/front/achievement-list/main');
        Achievement.published()
            .then((achievements) => {
                debug(util.format('rendering %d achievements', achievements.length));
                res.render(list_template, {achievements: achievements});
            })
            .then(null, next);
    })
    .get('/:id', (req, res, next) => {
        res.locals.page.application = path.join('pages/achievements/front-main-view');
        Achievement.findById(req.params.id)
            .populate('pictures')
            .where('published', true)
            .exec()
            .then((achievement) => {
                debug(util.format('rendering achievement: %s', achievement._id));
                res.render(page_template, {achievement: achievement});
            })
            .then(null, next);
    });

module.exports = router;
