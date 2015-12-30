/// products.MenuView
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Dec 21 22:43:33 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var functional = require('common/functional');

    var app_menu_template = require('text!pages/products/back/menu/menu.html');
    var product_list_menu_template = require('text!pages/products/back/menu/product-list-menu.html');
    var product_edit_menu_template = require('text!pages/products/back/menu/product-edit-menu.html');
    var reseller_list_menu_template = require('text!pages/products/back/menu/reseller-list-menu.html');
    var reseller_edit_menu_template = require('text!pages/products/back/menu/reseller-edit-menu.html');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var menu_proto = {
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({})
    };

    var ProductListMenu = Marionette.ItemView.extend(_.assign({
        template: _.template(product_list_menu_template),
        ui: {
            create: '#create-product'
        },
        events: {
            'click @ui.create': 'onCreate'
        },
        onCreate: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    }, menu_proto));

    var ProductEditMenu = Marionette.ItemView.extend(_.assign({
        template: _.template(product_edit_menu_template),
        ui: {
            save: '#save-product',
            remove: '#remove-product'
        },
        events: {
            'click @ui.save': 'onSave',
            'click @ui.remove': 'onRemove'
        },
        onSave: function(ev) {
            app_channel.commands.execute('product', 'save');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onRemove: function(ev) {
            app_channel.commands.execute('product', 'remove');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    }, menu_proto));

    var ResellerListMenu = Marionette.ItemView.extend(_.assign({
        template: _.template(reseller_list_menu_template),
        ui: {
            create: '#create-reseller'
        },
        events: {
            'click @ui.create': 'onCreate'
        },
        onCreate: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    }, menu_proto));

    var ResellerEditMenu = Marionette.ItemView.extend(_.assign({
        template: _.template(reseller_edit_menu_template),
        ui: {
            save: '#save-reseller',
            remove: '#remove-reseller'
        },
        events: {
            'click @ui.save': 'onSave',
            'click @ui.remove': 'onRemove'
        },
        onSave: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onRemove: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    }, menu_proto));

    return Marionette.LayoutView.extend(_.assign({
        template: _.template(app_menu_template),
        ui: {
            products: '#products',
            resellers: '#resellers'
        },
        regions: {
            'products-submenu-wrapper': '#products-submenu-wrapper',
            'resellers-submenu-wrapper': '#resellers-submenu-wrapper'
        },
        initialize: function() {
            var products = this.onProducts.bind(this);
            var edit_product = this.onEditProduct.bind(this);
            var resellers = this.onResellers.bind(this);
            var edit_reseller = this.onEditReseller.bind(this);
            var route_dispatch = functional.dispatch(
                function(route) {
                    if (route === 'products') {
                        products();
                        return true;
                    }
                },
                function(route) {
                    if (route === 'editProduct') {
                        edit_product();
                        return true;
                    }
                },
                function(route) {
                    if (route === 'resellers') {
                        resellers();
                        return true;
                    }
                },
                function(route) {
                    if (route === 'editReseller') {
                        edit_reseller();
                        return true;
                    }
                }
            );
            app_channel.commands.setHandler('route', route_dispatch);
        },
        onProducts: function() {
            this.showChildView('products-submenu-wrapper', new ProductListMenu);
            this.ui.products.parent().addClass('active');
            this.ui.resellers.parent().removeClass('active');
        },
        onEditProduct: function() {
            this.showChildView('products-submenu-wrapper', new ProductEditMenu);
            this.ui.products.parent().addClass('active');
            this.ui.resellers.parent().removeClass('active');
        },
        onResellers: function() {
            this.showChildView('resellers-submenu-wrapper', new ResellerListMenu);
            this.ui.resellers.parent().addClass('active');
            this.ui.products.parent().removeClass('active');
        },
        onEditReseller: function() {
            this.showChildView('resellers-submenu-wrapper', new ResellerEditMenu);
            this.ui.resellers.parent().addClass('active');
            this.ui.products.parent().removeClass('active');
        }
    }, menu_proto));
});
