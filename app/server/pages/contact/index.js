// pages/home/front.js
// ===================
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Tue May 12 20:57:49 CEST 2015

var _ = require('underscore');
var debug = require('debug')('mbac:routes:contact');
var express = require('express');
var path = require('path');
var util = require('util');

var router = express.Router();
var page_template = path.join(__dirname, 'views', 'front.jade');

router
    // GET achievements page.
    .get('/', function(req, res, next) {
            res.render(page_template);
    });

module.exports = {
    front: router
};
