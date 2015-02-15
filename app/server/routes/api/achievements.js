// api/achievements.js
// -------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var Achievement = require('models/achievement');
var async = require('async');
var debug = require('debug')('mbac:routes.achievements');
var express = require('express');
var formidableGrid = require('formidable-grid');
var helpers = require('routes/api/_helpers');
var GridFs = require('gridfs-stream');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Promise = mongoose.Promise;
var querystring = require('querystring');
var inspect = require('util').inspect;

var mongo = mongoose.mongo;
var router = express.Router();

function parse_data(req) {
    var promise = new mongoose.Promise;
    var data = {files: [], pictures: [], tags: []};
    var form = formidableGrid(req.db, mongo, {
        accept: ['image/.*']
    });

    _.bindAll(promise, 'fulfill', 'error');

    form
    .on('file', function(name, file) {
        if (name === 'pictures') {
            data.files.push({original: file.id});
        }
    })
    .on('field', function(name, value) {
        switch (name) {
        case 'pictures':
            data.pictures.push(new ObjectId(value));
            break;
        case 'tags':
            data.tags.push(value);
            break;
        default:
            _.extend(data, querystring.parse(name + '=' + value));
            break;
        }
    })
    .once('error', promise.error)
    .once('end', function() {
        promise.fulfill(data);
    })
    .parse(req);

    return promise;
};

var populate = function(doc, next) {
    var promise = new Promise(next);
    _.bindAll(promise, 'fulfill', 'error');
    Achievement.populate(doc, {path: 'pictures'})
        .then(promise.fulfill)
        .then(null, promise.error);
    return promise;
};

router
    .get('/', function(req, res, next) {
        Achievement.find().sort('-date').exec()
            .then(function(collection) {
                var promise = new Promise;
                _.bindAll(promise, 'resolve');
                async.map(collection, populate, promise.resolve);
                return promise;
            })
            .then(res.send.bind(res))
            .then(null, next);
    })
    .get('/:id', function(req, res, next) {
        Achievement
            .findById(req.params.id)
            .populate('pictures')
            .exec()
            .then(helpers.checkIfDefined)
            .then(function(achievement) {
                res.send(achievement);
            })
            .then(null, next);
    });

router
    .use('/', helpers.authorized())
    .param('id', function(req, res, next, id) {
        Achievement
            .findById(id)
            .exec()
            .then(helpers.checkIfDefined)
            .then(function(achievement) {
                req.achievement = achievement;
                next();
            })
            .then(null, next);
    });

router
    .route('/')
    .post(function(req, res, next) {
        parse_data(req)
            .then(function(data) {
                return Achievement.create(data);
            })
            .then(populate)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .all(helpers.forbidden());

router
    .route('/:id')
    .put(function(req, res, next) {
        parse_data(req)
            .then(req.achievement.patch.bind(req.achievement))
            .then(populate)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .delete(function(req, res, next) {
        req.achievement.destroy()
            .then(res.sendStatus.bind(res, 200))
            .then(null, next);
    })
    .all(helpers.forbidden());

module.exports = router;
