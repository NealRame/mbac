// admin.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Oct 22 22:40:49 CEST 2014

var _ = require('underscore');
var express = require('express');
var router = express.Router();

/* GET admin page. */
router
    .get('/', function(req, res) {
        res.locals.page = {stylesheet: '/css/admin_style.css'};
        res.render('admin', {
            title: 'mon Bar à Couture - l\'arrière boutique',
            page: {
                name: 'admin',
                stylesheets: ['/css/admin_style.css']
            }
        });
    });

module.exports = router;
