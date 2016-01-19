'use strict';

/// Products API
/// ============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:10:19 2015

const _ = require('underscore');
const debug = require('debug')('mbac:api:products');
const express = require('express');
const api = require('common/api');
const convert_eol = require('common/string').convertEOL;
const path = require('path');
const models_path = path.join(__dirname, '..', 'models');
const Product = require(path.join(models_path, 'product'));
const Reseller = require(path.join(models_path, 'reseller'));

const router = express.Router();

// Reseller CRUD operations
const Reseller_CRUD_helpers = api.createCRUDHelpers({
    model: Reseller,
    read_one(req, res) {
        return Reseller
            .findOne(Object.assign(
                {_id: req.params.id},
                !api.isAuthenticated(res) ? {published: true} : {}
            ))
            .populate('pictures')
            .exec();
    },
    read_all() {
        return Reseller
            .find({})
            .select('-description')
            .populate('pictures')
            .exec();
    },
    transform_data: api.createFormDataParser({
        accepted_mime_types: [/image\/.*/],
        fields: {
            address: _.first,
            description: (value) => convert_eol(_.first(value), '\r\n', '\n'),
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

// Product CRUD operations
const Product_CRUD_helpers = api.createCRUDHelpers({
    model: Product,
    read_one(req, res) {
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
    },
    read_all(req, res) {
        debug('-- load all products');
        return Product
            .find(Object.assign(
                !api.isAuthenticated(res) ? {published: true} : {},
                !api.isAuthenticated(res) ? {pictures: {$not: {$size: 0}}} : {}
            ))
            .populate('pictures')
            .populate('resellers', '-description')
            .exec();
    },
    transform_data: api.createFormDataParser({
        accepted_mime_types: [/image\/.*/],
        fields: {
            available: _.first,
            description: (value) => convert_eol(_.first(value), '\r\n', '\n'),
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
router.use(api.authenticationChecker());
router
    .route('/')
    .post(Product_CRUD_helpers.create)
    .all(api.forbidden());
router
    .route('/:id')
    .delete(Product_CRUD_helpers.delete)
    .put(Product_CRUD_helpers.update)
    .all(api.forbidden());

module.exports = router;
