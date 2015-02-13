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
var gm = require('gm');
var GridFs = require('gridfs-stream');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var path = require('path');
var querystring = require('querystring');
var inspect = require('util').inspect;

var mongo = mongoose.mongo;
var router = express.Router();

function error(res, err) {
    var err = err || new Error('Internal server error');
    var status = err.status || 500;

    res.status(status).send({
        status: status,
        message: err.message
    });
};

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
    .once('end', promise.fulfill)
    .parse(req);

    return promise;
};

router
    .get('/', function(req, res) {
        Achievement.find().sort('-date').exec()
            .then(res.send.bind(res))
            .then(null, error.bind(null, res));
    })
    .get('/:id', function(req, res) {
        Achievement
            .findById(req.params.id)
            .populate('pictures')
            .exec()
            .then(function(achievement) {
                if (achievement) {
                    res.send(achievement);
                } else {
                    res.sendStatus(404);
                }
            })
            .then(null, function(err) {
                res.status(500).send(err);
            });
    });

router
    .use('/', function(req, res, next) {
        if (res.locals.loggedIn) {
            next();
        } else {
            res.sendStatus(401);
        }
    })
    .param('id', function(req, res, next, id) {
        Achievement
            .findById(id)
            .exec()
            .then(function(achievement) {
                if (achievement) {
                    _.bindAll(achievement, 'path', 'destroy');
                    req.achievement = achievement;
                    next();
                } else {
                    throw _.extend(new Error('Not found'), {status: 404});
                }
            })
            .then(null, function(err) {
                res.status(err.status || 500).send(err);
            });
    });

router
    .route('/')
    .post(function(req, res) {
        parse_data(req)
            .then(function(data) {
                return Achievement.create(data);
            })
            .then(res.send.bind(res))
            .then(null, error.bind(null, res));
    });

router
    .route('/:id')
    .put(function(req, res) {
        parse_data(req)
            .then(req.achievement.patch)
            .then(res.send.bind(res))
            .then(null, error.bind(null, res));
    })
    .delete(function(req, res) {
        req.achievement.destroy()
            .then(res.sendStatus.bind(res, 200))
            .then(null, error.bind(null, res));
    });

module.exports = router;
