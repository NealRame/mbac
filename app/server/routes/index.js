// index.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>

var _ = require('underscore');
var Achievement = require('models/achievement');
var express = require('express');
var router = express.Router();

/* GET home page. */
router
    .get('/', function(req, res) {
        res.render('index', {title: 'mon Bar à Couture'});
    })
    .get('/pages/realisations', function(req, res, next) {
        Achievement.published()
            .then(function(achievements) {
                res.locals.achievements = achievements;
                res.render('achievements', {title: 'Réalisations'});
            })
            .then(null, next);
    });

module.exports = router;
