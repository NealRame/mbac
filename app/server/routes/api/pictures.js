'use strict';

/// api/pictures
/// ------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Jan 22 12:56:31 CET 2015

const _ = require('underscore');

const FormidableGrid = require('formidable-grid');
const Picture = require('models/picture');

const api = require('common/api');
const express = require('express');
const mongoose = require('mongoose');

const mongo = mongoose.mongo;
const router = express.Router();

router
    .param('id', (req, res, next, id) => Picture
        .findById(id)
        .exec()
        .then(api.exist)
        .then((picture) => {
            req.picture = picture;
            next();
        })
        .then(null, next)
    );

router
    .route('/')
    .get(function(req, res, next) {
        Picture.find().exec()
            .then(res.send.bind(res))
            .then(null, next);
    });

router
    .route('/:id')
    .get(function(req, res) {
        res.send(req.picture);
    });

router.use(api.authenticationChecker());

router
    .route('/')
    .post(function(req, res, next) {
        const form = new FormidableGrid(req.db, mongo, {
            accepted_mime_types: [/image\/.*/]
        });
        form.parse(req)
            .then(function(form_data) {
                const files = _.chain(form_data)
                    .filter(function(part) {
                        return part.field === 'files';
                    })
                    .map(_.property('value'))
                    .value();
                return Picture.create(files);
            })
            .then(function(pictures) {
                res.send(pictures);
            })
            .catch(next);
    })
    .all(api.forbidden());

router
    .route('/:id')
    .delete(function(req, res, next) {
        req.picture.destroy()
            .then(res.sendStatus.bind(res, 200))
            .then(null, next);
    })
    .all(api.forbidden());

module.exports = router;
