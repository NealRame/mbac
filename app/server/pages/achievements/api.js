'use strict';

/// api/achievements.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:10:19 2015

const _ = require('underscore');
const debug = require('debug')('mbac:routes.achievements');
const express = require('express');
const FormidableGrid = require('formidable-grid');
const api = require('common/api');
const mongo = require('mongodb');
const path = require('path');

const Achievement = require(path.join(__dirname, 'models', 'achievement'));
const router = express.Router();

function get_field(data, key, transform) {
    transform = transform || _.identity;
    return transform(
        _.chain(data)
            .filter((part) => part.field === key)
            .map(_.property('value'))
            .value()
    );
}

function make_object(data, attr_map) {
    return _.object(
        _.chain(attr_map)
            .map((transform, key) => {
                const value = get_field(data, key, transform);
                if (value) {
                    return [key, value];
                }
            })
            .compact()
            .value()
    );
}

function parse_data(req) {
    const form = new FormidableGrid(req.db, mongo, {
        accepted_mime_types: [/image\/.*/],
        accepted_field_names: ['name', 'date', 'description', 'files', 'pictures', 'published', 'tags']
    });
    return form.parse(req).then((form_data) => make_object(form_data, {
        date: _.first,
        description: _.first,
        files: _.identity,
        name: _.first,
        pictures: _.identity,
        published: _.first,
        tags: _.identity
    }));
}

function read_one(req, res) {
    const id = req.params.id;
    debug('-- load achievement[' + id + ']');
    return Achievement.findById(id).exec()
        .then(api.exist)
        .then((achievement) => (achievement.published || api.isAuthenticated(res))
            ? Achievement.populate(achievement, {path: 'pictures'})
            : api.error404()
        );
}

function read_all(req, res) {
    const query = {};
    if (!api.isAuthenticated(res)) {
        // Unauthorized client only get published and non-empty achievements
        // items.
        _.chain(query).extend({
            published: true,
            pictures: {$not: {$size: 0}}
        });
    }
    return (Achievement.find(query).sort('-date').exec()
        .then((achievements) => Achievement.populate(achievements, {path: 'pictures'})));
}

function achievement_create(req, res, next) {
    parse_data(req)
        .then(Achievement.create).then(res.send.bind(res), next);
}

function achievement_read(req, res, next) {
    const promise = _.isUndefined(req.params.id)
        ? read_all(req, res)
        : read_one(req, res);
    promise.then(res.send.bind(res), next);
}

function achievement_update(req, res, next) {
    Promise.all([read_one(req, res), parse_data(req, res)])
        .then((args) => Achievement.patch.apply(null, args))
        .then(res.send.bind(res), next);
}

function achievement_delete(req, res, next) {
    read_one(req, res)
        .then((achievement) => Achievement.delete(achievement))
        .then(res.send.bind(res), next);
}

router
    .get('/', achievement_read)
    .get('/:id', achievement_read);

router
    .use(api.authenticationChecker());

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
