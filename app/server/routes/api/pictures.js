'use strict';

/// api/pictures
/// ------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Jan 22 12:56:31 CET 2015

const api = require('common/api');
const express = require('express');
const FormidableGrid = require('formidable-grid');
const mongoose = require('mongoose');
const Picture = require('models/picture');

const mongo = mongoose.mongo;
const router = express.Router();

router
    .param('id', (req, res, next, id) => Picture.findById(id).exec()
        .then(api.exist)
        .then((picture) => {
            req.picture = picture;
            next();
        })
        .then(null, next)
    );

router
    .route('/')
    .get((req, res, next) => Picture.find().exec()
        .then((pictures) => res.send(pictures))
        .then(null, next)
    );

router
    .route('/:id')
    .get((req, res) => res.send(req.picture));

// router.use(api.authenticationChecker());

function form_data_to_pictures_data(form_data) {
    return (form_data
        .filter((part) => part.field === 'files')
        .map((part) => part.value)
    );
}

router
    .route('/')
    .post((req, res, next) => {
        const form = new FormidableGrid(req.db, mongo, {
            accepted_mime_types: [/image\/.*/]
        });
        form.parse(req)
            .then(form_data_to_pictures_data)
            .then((pictures_data) => Picture.create(pictures_data))
            .then((pictures) => res.send(pictures))
            .catch(next);
    })
    .all(api.forbidden());

router
    .route('/:id')
    .delete((req, res, next) => {
        req.picture.remove()
            .then(() => res.sendStatus(200))
            .then(null, next);
    })
    .all(api.forbidden());

module.exports = router;
