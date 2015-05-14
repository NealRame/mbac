// api/achievements.js
// -------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Apr  2 13:10:19 2015

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('mbac:routes.achievements');
var express = require('express');
var FormidableGrid = require('formidable-grid');
var api = require('common/api');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var path = require('path');
var querystring = require('querystring');
var inspect = require('util').inspect;

var Achievement = require(path.join(__dirname, 'models', 'achievement'));
var ObjectId = mongoose.Types.ObjectId;
var router = express.Router();

function parse_data(req) {
    var form = new FormidableGrid(req.db, mongo, {
        accepted_mime_types: [/image\/.*/],
        accepted_field_names: ['name', 'date', 'description', 'files', 'pictures', 'published', 'tags']
    });
    function get_field(data, key, transform) {
        transform = transform || _.identity;
        return transform(
            _.chain(data)
                .filter(function(part) {
                    return part.field === key;
                })
                .map(_.property('value'))
                .value()
        );
    }
    function make_object(data, attr_map) {
        return _.object(
            _.chain(attr_map)
                .map(function(transform, key) {
                    var value = get_field(data, key, transform);
                    if (value) {
                        return [key, value];
                    }
                })
                .compact()
                .value()
        );
    }
    return form.parse(req)
        .then(function(form_data) {
            return make_object(form_data, {
                date: _.first,
                description: _.first,
                files: _.identity,
                name: _.first,
                pictures: _.identity,
                published: _.first,
                tags: _.identity
            });
        });
}

function read_one(req, res) {
    var id = req.params.id;
    debug('-- load achievement[' + id + ']');
    return Achievement.findById(id).exec()
        .then(api.exist)
        .then(function(achievement) {
            if (! (achievement.published || api.isAuthenticated(res))) {
                api.throw404(); // 401 or 404 ?
            }
            return Achievement.populate(achievement, {path: 'pictures'});
        });
}

function read_all(req, res) {
    var query = {};
    if (! api.isAuthenticated(res)) {
        // Unauthorized client only get published and non-empty achievements
        // items.
        _.chain(query).extend({
            published: true,
            pictures: {$not: {$size: 0}}
        });
    }
    return Achievement.find(query).sort('-date').exec().then(function(achievements) {
        return Achievement.populate(achievements, {path: 'pictures'});
    });
}

function achievement_create(req, res, next) {
    parse_data(req)
        .then(Achievement.create).then(res.send.bind(res), next);
}

function achievement_read(req, res, next) {
    var promise = _.isUndefined(req.params.id)
        ? read_all(req, res)
        : read_one(req, res);
    promise.then(res.send.bind(res), next);
}

function achievement_update(req, res, next) {
    Promise.all([read_one(req, res), parse_data(req, res)])
        .then(function(args) {
            return Achievement.patch.apply(null, args);
        })
        .then(res.send.bind(res), next);
}

function achievement_delete(req, res, next) {
    read_one(req, res)
        .then(function(achievement) {
            return Achievement.delete(achievement);
        })
        .then(res.send.bind(res), next);
}

router
    .get('/', achievement_read)
    .get('/:id', achievement_read);

// router
// .use('/', api.authorized())

router
    .route('/')
    .post(achievement_create)
    .all(api.forbidden());

router
    .route('/:id')
    .put(achievement_update)
    .delete(achievement_delete)
    .all(api.forbidden());

module.exports = router;
