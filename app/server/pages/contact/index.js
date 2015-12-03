'use strict';

/// pages/home/front.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const _ = require('underscore');

const api =  require('common/api');
const debug = require('debug')('mbac:routes:contact');
const express = require('express');
const mail_transport_config = require('config').mailtransport;
const mailchimp_config = require('config').mailchimp;
const nodemailer = require('nodemailer');
const path = require('path');
const url = require('url');
const util = require('util');

const page_template = path.join(__dirname, 'views', 'front.jade');

const front_controller = express.Router();

// GET /contact page.
front_controller.get('/', (req, res) => {
    res.render(page_template);
});

const api_controller = express.Router();

// POST to /api/contact/mail
if (mail_transport_config) {
    // debug(mail_transport_config);
    const smtp_transporter = nodemailer.createTransport(((type, config) => {
        switch (type) {
            case 'sendmail':
                return require('nodemailer-sendmail-transport')(config);
            case 'smtp':
                return config;
            default:
                return null;
        }
    })(mail_transport_config.type, _.omit(mail_transport_config, 'type', 'to')));

    api_controller.post('/mail', (req, res, next) => {
        const data = req.body;
        debug(util.format('received mail data %s', util.inspect(data)));
        smtp_transporter.sendMail({
            to: mail_transport_config.to,
            from: util.format('<%s> %s', data.name, data.from),
            replyTo: data.from,
            sender: data.from,
            subject: data.subject,
            text: util.format('Message de: %s\n%s', data.name, data.message)
        }, (err) => {
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
    const mailchimp = url.parse(mailchimp_config.endpoint + '/lists/' + mailchimp_config.list_id + '/members');
    const protocol = require(mailchimp.protocol === 'https:' ? 'https' : 'http');
    _.extend(mailchimp, {
        auth: 'mbac:' + mailchimp_config.apikey,
        method: 'POST'
    });
    // debug(mailchimp);
    api_controller.post('/subscribe', (req, res, next) => {
        const data = JSON.stringify(
            _.chain(req.body)
                .pick('email_address')
                .defaults({status: 'subscribed'})
                .value()
        );
        debug(util.format('received subscribe data %s', util.inspect(data)));
        const request = protocol.request(
            _.extend({
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }, mailchimp),
            (remote_res) => {
                const status = remote_res.statusCode;
                if (status > 299) {
                    debug('mailchimp respond with status: ' + status);
                    next(api.error500());
                } else {
                    res.send('OK');
                }
            }
        );
        request.on('error', next);
        request.write(data);
        request.end();
    });
}

module.exports = {
    api: api_controller,
    front: front_controller
};
