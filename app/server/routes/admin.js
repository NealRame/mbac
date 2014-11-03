// admin.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Oct 22 22:40:49 CEST 2014

var _ = require('underscore');
var express = require('express');
var router = express.Router();

var locals = {
    app:   'back/main',
    css:   '/css/admin_style.css',
    title: 'mon Bar à Couture - l\'arrière boutique'
};

var process = function(res, data) {
    res.render('admin', _.extend(data, locals));
}

/* GET admin page. */
router
    .get('/', function(req, res) {
        process(res, {});
    })
    .get('/blog', function(req, res) {
        process(res, {panel: 'blog'});
    })
    .get('/gallery', function(req, res) {
        process(res, {panel: 'gallery'});
    })
    .get('/pages', function(req, res) {
        process(res, {panel: 'pages'});
    })

module.exports = router;
