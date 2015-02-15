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

function populate(doc, cb) {
    var promise = new Promise(cb);
    _.bindAll(promise, 'resolve');
    if (_.isArray(doc)) {
        var docs = doc;
        async.map(docs, populate, promise.resolve);
    } else {
        doc.populate(promise.resolve);
    }
    return promise;
};

function create(req, cb) {
    var promise = new Promise(cb);
    _.bindAll(promise, 'fulfill', 'error');
    parse_data(req)
        .then(Achievement.create)
        .then(populate)
        .then(promise.fulfill)
        .then(promise.error);
    return promise;
}

function read(id, cb) {
    var promise = new Promise(cb);
    _.bindAll(promise, 'fulfill', 'error');
    Achievement.findById(id).exec()
        .then(helpers.assertIsDefined)
        .then(function(doc) {
            return populate(doc);
        })
        .then(function(doc) {
            promise.fulfill(doc);
        })
        .then(promise.error);
    return promise;
}

function update(req, cb) {
    var promise = new Promise(cb);
    var achievement = req.achievement;
    _.bindAll(promise, 'fulfill', 'error');
    parse_data(req)
        .then(achievement.patch.bind(achievement))
        .then(populate)
        .then(promise.fulfill)
        .then(promise.error);
    return promise;
};

router
    .get('/', function(req, res, next) {
        Achievement.find().sort('-date').exec()
            .then(populate)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .get('/:id', function(req, res, next) {
        read(req.params.id)
            .then(res.send.bind(res))
            .then(null, next);
    });

router
    // .use('/', helpers.authorized())
    .param('id', function(req, res, next, id) {
        read(id)
            .then(function(achievement) {
                req.achievement = achievement;
                next();
            })
            .then(null, next);
    });

router
    .route('/')
    .post(function(req, res, next) {
        create(req)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .all(helpers.forbidden());

router
    .route('/:id')
    .put(function(req, res, next) {
        update(req)
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
