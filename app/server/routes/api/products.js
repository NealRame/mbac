// api/product.js
// --------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var express = require('express');
var router = express.Router();

router
    .use(function(req, res, next) {
        // if (! res.isLoggedIn) {
        //     return res.status(401).send({status: 401, message: "Unauthorized"});
        // }
        next();
    })
    .route('/')
        .get(function(req, res) {
            res.send({});
        })
        .post(function(req, res) {
            res.send({});
        });

module.exports = router;
