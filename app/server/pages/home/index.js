// pages/home/front.js
// ===================
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Tue May 12 20:57:49 CEST 2015

var _ = require('underscore');
var debug = require('debug')('mbac:routes:home');
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var util = require('util');

var router = express.Router();
var page_template = path.join(__dirname, 'views', 'front.jade');


function last_achievement(count) {
    return new Promise(function(resolve, reject) {
        var Achievement = mongoose.model('Achievement');
        if (_.isUndefined(Achievement)) {
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
    .get('/', function(req, res, next) {
        last_achievement(3)
            .then(function(achievements) {
                debug(util.format('-- Found %s last achievement(s)', achievements.length));
                res.locals.achievements = achievements;
                res.render(page_template);
            });
    });

module.exports = {
    front: router
};
