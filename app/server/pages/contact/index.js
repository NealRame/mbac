// pages/home/front.js
// ===================
// - author: Neal.Rame. <contact@nealrame.com>
// -  date:  Tue May 12 20:57:49 CEST 2015

var _ = require('underscore');

var api =  require('common/api');
var debug = require('debug')('mbac:routes:contact');
var express = require('express');
var mail_transport_config = require('config').mailtransport;
var mailchimp_config = require('config').mailchimp;
var nodemailer = require('nodemailer');
var path = require('path');
var url = require('url');
var util = require('util');

var page_template = path.join(__dirname, 'views', 'front.jade');
var front_controller = express.Router()
    // GET /contact page.
    .get('/', function(req, res) {
        res.render(page_template);
    });

var api_controller = express.Router();

// POST to /api/contact/mail
if (mail_transport_config) {
    // debug(mail_transport_config);
    var smtp_transporter = nodemailer.createTransport((function(type, config) {
        switch (type) {
            case 'sendmail':
                return require('nodemailer-sendmail-transport')(config);
            case 'smtp':
                return config;
            default:
                return null;
        }
    })(mail_transport_config.type, _.omit(mail_transport_config, 'type', 'to')));

    api_controller.post('/mail', function(req, res, next) {
        var data = req.body;
        debug(util.format('received mail data %s', util.inspect(data)));
        smtp_transporter.sendMail({
            to: mail_transport_config.to,
            from: util.format('<%s> %s', data.name, data.from),
            replyTo: data.from,
            sender: data.from,
            subject: data.subject,
            text: util.format('Message de: %s\n%s', data.name, data.message)
        }, function(err) {
            if (err) {
                debug(err); // TODO log error.
                return next(err);
            }
            res.send('OK');
        });
    });
}

// POST to /api/contact/subscribe
if (mailchimp_config) {
    // debug(mailchimp_config);
    var mailchimp = url.parse(mailchimp_config.endpoint + '/lists/' + mailchimp_config.list_id + '/members');
    var protocol = require(mailchimp.protocol === 'https:' ? 'https' : 'http');
    _.extend(mailchimp, {
        auth: 'mbac:' + mailchimp_config.apikey,
        method: 'POST'
    });
    // debug(mailchimp);
    api_controller.post('/subscribe', function(req, res, next) {
        var data = JSON.stringify(
            _.chain(req.body)
                .pick('email_address')
                .defaults({status: 'subscribed'})
                .value()
        );
        debug(util.format('received subscribe data %s', util.inspect(data)));
        var request = protocol.request(_.extend({
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }}, mailchimp), function(remote_res) {
            var status = remote_res.statusCode;
            if (status > 299) {
                debug('mailchimp respond with status: ' + status);
                next(api.error500());
            } else {
                res.send('OK');
            }
        });
        request.on('error', next);
        request.write(data);
        request.end();
    });
}

module.exports = {
    api: api_controller,
    front: front_controller
};
