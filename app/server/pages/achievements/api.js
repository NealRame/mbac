// api/achievements.js
// -------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Apr  2 13:10:19 2015

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('mbac:routes.achievements');
var express = require('express');
var formidableGrid = require('formidable-grid');
var helpers = require('helpers');
var GridFs = require('gridfs-stream');
var mongoose = require('mongoose');
var path = require('path');
var querystring = require('querystring');
var inspect = require('util').inspect;

var Achievement = require(path.join(__dirname, 'models', 'achievement'));
var ObjectId = mongoose.Types.ObjectId;
var Promise = mongoose.Promise;
var mongo = mongoose.mongo;
var router = express.Router();

function parse_data(req) {
    var promise = new mongoose.Promise();
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
}

function read(req, res) {
    var promise = new Promise();
    var query = {};

    if (! helpers.isAuthenticated(res)) {
        // Unauthorized client only get published and non-empty achievements
        // items.
        _.chain(query)
            .extend({published: true})
            .extend({pictures: {$not: {$size: 0}}});
    }

    _.bindAll(promise, 'fulfill', 'error');
    Achievement.find(query).exec()
        .then(function(collection) {
            return Achievement.populate(collection, {path: 'pictures'});
        })
        .then(promise.fulfill)
        .then(null, promise.error);

    return promise;
}

function readOne(req, res, id) {
    var promise = new Promise();

    _.bindAll(promise, 'fulfill', 'error');
    Achievement.findById(id).exec()
        .then(helpers.checkValue)
        .then(function(achievement) {
            if (! (achievement.published || helpers.isAuthenticated(res))) {
                helpers.throw404(); // 401 or 404 ?
            }
            return Achievement.populate(achievement, {path: 'pictures'});
        })
        .then(promise.fulfill)
        .then(null, promise.error);

    return promise;
}

function create(req, res) {
}

router
    .param('id', function(req, res, next, id) {
        debug('load achievement[' + id + ']');
        readOne(req, res, id)
            .then(function(achievement) {
                req.achievement = achievement;
                next();
            })
            .then(null, function(err) {
                debug(err);
                next(err);
            });
    });

router
    .get('/', function(req, res, next) {
        read(req, res)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .get('/:id', function(req, res, next) {
        res.send(req.achievement);
    });

// router
// .use('/', helpers.authorized())

router
    .route('/')
    .post(function(req, res, next) {
        parse_data(req)
            .then(Achievement.create)
            .then(res.send.bind(res))
            .then(null, next);
    })
    .all(helpers.forbidden());

router
    .route('/:id')
    .put(function(req, res, next) {
        parse_data(req)
            .then(Achievement.patch.bind(null, req.achievement))
            .then(res.send.bind(res))
            .then(null, next);
    })
    .delete(function(req, res, next) {
        Achievement.delete(req.achievement)
            .then(res.sendStatus.bind(res, 200))
            .then(null, next);
    })
    .all(helpers.forbidden());

module.exports = router;
