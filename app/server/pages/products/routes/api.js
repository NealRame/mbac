'use strict';

/// Products API
/// ============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:10:19 2015

const _ = require('underscore');
const debug = require('debug')('mbac:api:products');
const express = require('express');
const FormidableGrid = require('formidable-grid');
const api = require('common/api');
const mongo = require('mongodb');
const path = require('path');

const models_path = path.join(__dirname, '..', 'models');

const Product = require(path.join(models_path, 'product'));
const Reseller = require(path.join(models_path, 'reseller'));

const router = express.Router();

// Data parsing helpers
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

function create_data_parser(options) {
    return function parser(req) {
        const field_transformers = options.field_transformers || {};
        const accepted_field_names = _.keys(options.field_transformers);
        const accepted_mime_types = options.accepted_mime_types;
        const form = new FormidableGrid(
            req.db, mongo,
            {accepted_mime_types, accepted_field_names}
        );
        return form.parse(req).then((form_data) => make_object(form_data, field_transformers));
    };
}

// CRUD operations helper
function create_CRUD_helpers(options) {
    const Model = options.model;
    const parse_data = options.parse_data;
    const read_one = options.read_one;
    const read_all = options.read_all;
    return {
        create(req, res, next) {
            parse_data(req)
                .then(Model.create)
                .then((doc) => res.send(doc), next);
        },
        read(req, res, next) {
            (_.isUndefined(req.params.id)
                ? read_all(req, res)
                : read_one(req, res)
            ).then((docs) => res.send(docs), next);
        },
        update(req, res, next) {
            Promise
                .all([read_one(req, res), parse_data(req, res)])
                .then((args) => Model.patch.apply(null, args))
                .then((doc) => res.send(doc), next);
        },
        delete(req, res, next) {
            read_one(req, res)
                .then((doc) => Model.delete(doc))
                .then(() => res.send({}), next)
        }
    }
}

// Product CRUD operations
function product_read_one(req, res) {
    const id = req.params.id;
    debug('-- load product[' + id + ']');
    return Product
        .findOne(Object.assign(
            { _id: id },
            !api.isAuthenticated(res) ? {published: true} : {}
        ))
        .populate('pictures')
        .populate('resellers', '-description')
        .exec()
        .then(api.exist);
}

function product_read_all(req, res) {
    debug('-- load all products');
    return Product
        .find(Object.assign(
            !api.isAuthenticated(res) ? {published: true} : {},
            !api.isAuthenticated(res) ? {pictures: {$not: {$size: 0}}} : {}
        ))
        .populate('pictures')
        .populate('resellers', '-description')
        .exec();
}

const Product_CRUD_helpers = create_CRUD_helpers({
    read_one: product_read_one,
    read_all: product_read_all,
    parse_data: create_data_parser({
        accepted_mime_types: [/image\/.*/],
        field_transformers: {
            available: _.first,
            description: _.first,
            files: _.identity,
            name: _.first,
            pictures: _.identity,
            price: _.first,
            published: _.first,
            resellers: _.identity,
            tags: _.identity
        }
    })
});

router
    .get('/', Product_CRUD_helpers.read)
    .get('/:id', Product_CRUD_helpers.read);

router
    .use(api.authenticationChecker());

router
    .route('/')
    .post(Product_CRUD_helpers.create)
    .all(api.forbidden());

router
    .route('/:id')
    .delete(Product_CRUD_helpers.delete)
    .put(Product_CRUD_helpers.update)
    .all(api.forbidden());

// Reseller CRUD operations
function reseller_read_one(req, res) {
    Reseller
        .findOne(Object.assign(
            {_id: req.params.id},
            !api.isAuthenticated(res) ? {published: true} : {}
        ))
        .populate('pictures')
        .exec();
}

function reseller_read_all() {
    Reseller
        .find({})
        .select('-description')
        .populate('pictures')
        .exec();
}

const Reseller_CRUD_helpers = create_CRUD_helpers({
    read_one: reseller_read_one,
    read_all: reseller_read_all,
    parse_data: create_data_parser({
        accepted_mime_types: [/image\/.*/],
        field_transformers: {
            address: _.first,
            description: _.first,
            files: _.identity,
            mail: _.first,
            name: _.first,
            phone: _.first,
            pictures: _.identity,
            published: _.first,
            www: _.first
        }
    })
});

router.get('/resellers/:id', Reseller_CRUD_helpers.read);

router.use(api.authenticationChecker());

router
    .route('/resellers')
    .get(Reseller_CRUD_helpers.read)
    .post(Reseller_CRUD_helpers.create)
    .all(api.forbidden());

router
    .route('/resellers/:id')
    .delete(Reseller_CRUD_helpers.delete)
    .put(Reseller_CRUD_helpers.update)
    .all(api.forbidden());

module.exports = router;
