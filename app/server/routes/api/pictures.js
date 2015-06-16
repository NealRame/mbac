// api/pictures
// ------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Jan 22 12:56:31 CET 2015

var _ = require('underscore');

var FormidableGrid = require('formidable-grid');
var Picture = require('models/picture');

var api = require('common/api');
var express = require('express');
var mongoose = require('mongoose');

var mongo = mongoose.mongo;
var router = express.Router();

router
    .param('id', function(req, res, next, id) {
        Picture
            .findById(id)
            .exec()
            .then(api.valueChecker(api.error404))
            .then(function(picture) {
                req.picture = picture;
                next();
            })
            .then(null, next);
    });

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
        var form = new FormidableGrid(req.db, mongo, {
            accepted_mime_types: [/image\/.*/]
        });
        form.parse(req)
            .then(function(form_data) {
                var files = _.chain(form_data)
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
