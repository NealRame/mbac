// pages/home/front.js
// ===================
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Tue May 12 20:57:49 CEST 2015

var _ = require('underscore');

var debug = require('debug')('mbac:routes:contact');
var express = require('express');
var mail_transport_config = require('config').mailtransport;
var nodemailer = require('nodemailer');
var path = require('path');
var util = require('util');

var page_template = path.join(__dirname, 'views', 'front.jade');
var front_controller = express.Router()
    // GET /contact page.
    .get('/', function(req, res, next) {
        res.render(page_template);
    });

var api_controller = express.Router();

// debug(mail_transport_config);

// POST to /api/contact/mail
if (mail_transport_config) {
    var smtp_transporter = nodemailer.createTransport(mail_transport_config);
    api_controller.post('/mail', function(req, res, next) {
        var data = req.body;
        debug(util.format('received mail data %s', util.inspect(data)));
        smtp_transporter.sendMail({
            to: mail_transport_config.to,
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
    });
}

module.exports = {
    api: api_controller,
    front: front_controller
};
