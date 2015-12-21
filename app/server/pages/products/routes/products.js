'use strict';

/// Products routes
/// ===============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date:  Sat Dec 19 02:22:22 CET 2015

const debug = require('debug')('mbac:routes:products');
const existy = require('common/api').exist;
const express = require('express');
const path = require('path');
const util = require('util');

const models_path = path.join(__dirname, '..', 'models');
const views_path = path.join(__dirname, '..', 'views');
const products_template = path.join(views_path, 'products.jade');
const product_template = path.join(views_path, 'product.jade');
const reseller_template = path.join(views_path, 'reseller.jade');

const Product = require(path.join(models_path, 'product'));
const Reseller = require(path.join(models_path, 'reseller'));

const router = express.Router();

router
    // GET achievements page.
    .get('/', (req, res, next) => {
        res.locals.page.application = path.join('pages/products/products-main');
        Product
            .published()
            .then((products) => {
                debug(util.format('rendering %d products', products.length));
                res.render(products_template, {products});
            }, next);
    })
    .get('/:id', (req, res, next) => {
        res.locals.page.application = path.join('pages/products/product-main');
        Product
            .findById(req.params.id)
            .populate('pictures')
            .populate({
                match: {published: true},
                path: 'resellers',
                select: 'name address'
            })
            .exec()
            .then(existy)
            .then((product) => {
                debug(util.format('rendering product: %s', product._id));
                res.render(product_template, {product});
            }, next);
    })
    .get('/resellers/:id', (req, res, next) => {
        res.locals.page.application = path.join('pages/products/reseller-view');
        Reseller
            .findById(req.params.id)
            .exec()
            .then(existy)
            .then((reseller) => {
                debug(util.format('rendering reseller: %s', reseller._id));
                res.render(reseller_template, {reseller});
            }, next);
    });

module.exports = router;
