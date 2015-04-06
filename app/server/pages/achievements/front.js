// front.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Fri Apr  3 01:05:57 2015

var _ = require('underscore');
var debug = require('debug')('mbac:routes:achievements');
var express = require('express');
var path = require('path');

var Achievement = require(path.join(__dirname, 'models', 'achievement'));
var router = express.Router();

var list_template = path.join(__dirname, 'views', 'achievements.jade');
var page_template = path.join(__dirname, 'views', 'achievement.jade');

router
    // GET achievements page.
    .get('/', function(req, res, next) {
        Achievement.published()
            .then(function(achievements) {
                res.render(list_template, {achievements: achievements});
            })
            .then(null, next);
    })
    .get('/:id', function(req, res, next) {
        Achievement.findById(req.params.id)
            .populate('pictures')
            .where('published', true)
            .exec()
            .then(function(achievement) {
                res.render(page_template, {achievement: achievement});
            })
            .then(null, next);
    });

module.exports = router;
