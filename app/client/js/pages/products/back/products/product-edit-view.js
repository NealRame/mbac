/// Product editor view.
/// ====================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Dec 27 17:42:50 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
	var Backbone = require('backbone');
    var Marionette = require('marionette');
	var PictureList = require('PictureList');
    var template = require('text!pages/products/back/products/product-edit-view.html');

    return Marionette.LayoutView.extend({
        ui: {
            name: '#name',
            description: '#description',
			price: '#price',
			published: '#published',
            tags: '#tags'
        },
		regions: {
			pictures: '#pictures'
		},
        template: _.template(template),
		initialize: function() {
			this.productPictureList = new PictureList({
				collection: new Backbone.Collection(this.model.pictures())
			});
		},
        onRender: function() {
            this.ui.name.val(this.model.name());
            this.ui.tags.val(this.model.tags().join(', '));
            this.ui.description.val(this.model.description());
			this.ui.published.val(this.model.published());
			this.ui.price.val(this.model.get('price'));
			this.showChildView('pictures', this.productPictureList);
        }
    });
});
