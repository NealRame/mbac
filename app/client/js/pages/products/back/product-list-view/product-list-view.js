/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 23:28:36 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
	var ProductList = require('pages/products/common/product-list-view/product-list-view');
    var template = require('text!pages/products/back/product-list-view/product-list-view.html');

    return Marionette.LayoutView.extend({
        template: _.template(template),
        regions: {
            list: '#product-list'
        },
        onRender: function() {
            this.showChildView('list', new ProductList({
                collection: this.collection,
				editable: true
            }));
        }
    });
});
