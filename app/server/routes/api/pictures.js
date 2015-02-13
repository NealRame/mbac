// api/pictures
// ------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Jan 22 12:56:31 CET 2015

var _ = require('underscore');
var express = require('express');
var formidableGrid = require('formidable-grid');
var GridFs = require('gridfs-stream');
var inspect = require('util').inspect;
var mongoose = require('mongoose');
var mongo = mongoose.mongo;
var path = require('path');
var Picture = require('models/picture');
var Promise = mongoose.Promise;

var router = express.Router();

function _404() {
    throw _.extend(new Error('Not found'), {status: 404});
};

function parse_picture_data(req) {
    var promise = new Promise;
    var files = [];
    var form = formidableGrid(req.db, mongo, {
        accept: ['image/.*']
    });

    form.multiples = false;
    form.maxFields = 1;
    form
        .on('file', function(name, file) {
            files.push({original: file.id});
        })
        .once('error', promise.error.bind(promise))
        .once('end', function() {
            promise.fulfill(files[0]);
        })
        .parse(req);

    return promise;
};

router
    .route('/')
        .get(function(req, res, next) {
            Picture.find().exec()
                .then(res.send.bind(res))
                .then(null, next);
        })
        .post(function(req, res, next) {
            parse_picture_data(req)
                .then(function(data) {
                    return Picture.create(data);
                })
                .then(res.send.bind(res))
                .then(null, next);
        })
        .all(_404);

router
    .param('id', function(req, res, next, id) {
        Picture
            .findById(id)
            .exec()
            .then(function(picture) {
                if (picture) {
                    req.picture = picture;
                    next();
                } else {
                    _404();
                }
            })
            .then(null, next);
    })
    .route('/:id')
        .get(function(req, res) {
            res.send(req.picture);
        })
        .delete(function(req, res, next) {
            req.picture.destroy()
                .then(function() {
                    res.sendStatus(200);
                })
                .then(null, next);
        })
        .all(_404);

module.exports = router;
