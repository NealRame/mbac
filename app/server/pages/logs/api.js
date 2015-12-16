'use strict';

/// server/pages/logs/api.js
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Sat Dec 12 12:25:04 CET 2015

// const debug = require('debug')('mbac:routes.logs');
const api = require('common/api');
const express = require('express');
const path = require('path');
const Log = require(path.join(__dirname, 'models', 'log'));

const router = express.Router();

router
    .use(api.authenticationChecker())
    .get('/', (req, res, next) => {
        Log.find({})
            .exec()
            .then((logs) => res.send(logs), next);
    })
    .get('/:id', (req, res, next) => {
        Log.findById(req.params.id)
            .exec()
            .then((log) => res.send(log), next);
    })
    .delete('/:id', (req, res) => {
        Log.findByIdAndRemove(req.params.id).exec();
        res.status(200).send('OK');
    })
    .all(api.forbidden());

module.exports = router;
