/// products.MenuView
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Dec 21 22:43:33 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var template = require('text!pages/products/back/menu/menu.html');

    return Marionette.ItemView.extend({
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({}),
        template: _.template(template),
        ui: {
            createProduct: '#create-product',
            createReseller: '#create-reseller'
        },
        events: {
            'click @ui.createProduct': 'onCreateProduct',
            'click @ui.createReseller': 'onCreateReseller'
        },
        onCreateProduct: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onCreateReseller: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    });
});
