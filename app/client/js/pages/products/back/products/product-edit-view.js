/// Product editor view.
/// ====================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Dec 27 17:42:50 CET 2015
define(function(require) {
	'use strict';

	var $ = require('jquery');
    var _ = require('underscore');
	var Backbone = require('backbone');
    var Marionette = require('marionette');
	var PictureList = require('PictureList');
	var functional = require('common/functional');
    var template = require('text!pages/products/back/products/product-edit-view.html');

    return Marionette.LayoutView.extend({
		id: 'editor-wrapper',
        ui: {
			price: '#price',
			published: '#published',
            description: '#description',
            name: '#name',
            tags: '#tags',
			inputs: 'input, textarea'
        },
		events: {
			'focus @ui.inputs': 'onInputFocus',
			'blur @ui.inputs': 'onInputFocus'
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
		onInputFocus: functional.dispatch(
			function(ev) {
				if (ev.type === 'focusin') {
					$(ev.target).parent().addClass('filled');
					return true;
				}
			},
			function(ev) {
				if (ev.type === 'focusout') {
					$(ev.target).parent().removeClass('filled');
					return true;
				}
			}
		),
        onRender: function() {
            this.ui.name.val(this.model.name());
            this.ui.tags.val(this.model.tags().join(', '));
            this.ui.description.val(this.model.description());
			this.ui.published.prop('checked', this.model.published());
			this.ui.price.val(this.model.get('price'));
			this.showChildView('pictures', this.productPictureList);
        }
    });
});
