'use strict';

/// api/achievements.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:10:19 2015

const _ = require('underscore');
const debug = require('debug')('mbac:routes.achievements');
const express = require('express');
const api = require('common/api');
const path = require('path');
const Achievement = require(path.join(__dirname, 'models', 'achievement'));

const router = express.Router();

// Product CRUD operations
const Achievement_CRUD_helpers = api.createCRUDHelpers({
    model: Achievement,
    read_one(req, res) {
        const id = req.params.id;
        debug('-- load product[' + id + ']');
        return Achievement
            .findOne(Object.assign(
                { _id: id },
                !api.isAuthenticated(res) ? {published: true} : {}
            ))
            .populate('pictures')
            .exec()
            .then(api.exist);
    },
    read_all(req, res) {
        debug('-- load all achievements');
        return Achievement
            .find(Object.assign(
                !api.isAuthenticated(res) ? {published: true} : {},
                !api.isAuthenticated(res) ? {pictures: {$not: {$size: 0}}} : {}
            ))
            .populate('pictures')
            .exec();
    },
    transform_data: api.createFormDataParser({
        accepted_mime_types: [/image\/.*/],
        fields: {
            date: _.first,
            description: (value) => _.first(value).replace(/\r\n/g, '\n'),
            files: _.identity,
            name: _.first,
            pictures: _.identity,
            published: _.first,
            tags: _.identity
        }
    })
});

router
    .get('/', Achievement_CRUD_helpers.read)
    .get('/:id', Achievement_CRUD_helpers.read);
router.use(api.authenticationChecker());
router
    .route('/')
    .post(Achievement_CRUD_helpers.create)
    .all(api.forbidden());
router
    .route('/:id')
    .delete(Achievement_CRUD_helpers.delete)
    .put(Achievement_CRUD_helpers.update)
    .all(api.forbidden());

module.exports = router;
