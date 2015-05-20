// pages/home/front.js
// ===================
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Tue May 12 20:57:49 CEST 2015

var _ = require('underscore');
var config = require('config').mail;
var debug = require('debug')('mbac:routes:contact');
var express = require('express');
var nodemailer = require('nodemailer');
var path = require('path');
var util = require('util');

var page_template = path.join(__dirname, 'views', 'front.jade');
var front_controller = express.Router()
    // GET /contact page.
    .get('/', function(req, res, next) {
        res.render(page_template);
    });

var smtp_transporter =
    config
        ? nodemailer.createTransport(config)
        : null;

var api_controller = express.Router()
    // POST to /api/contact
    .post('/', function(req, res, next) {
        var data = req.body;
        debug(util.format('received %s', util.inspect(data)));
        if (smtp_transporter) {
            smtp_transporter.sendMail({
                to: config.to,
                from: util.format('<%s> %s', data.name, data.from),
                replyTo: data.from,
                sender: data.from,
                subject: data.subject,
                text: data.message
            }, function(err) {
                if (err) {
                    return next(err);
                }
                res.send('OK');
            });
        } else {
            res.sendStatus(500);
        }
    });

module.exports = {
    api: api_controller,
    front: front_controller
};
