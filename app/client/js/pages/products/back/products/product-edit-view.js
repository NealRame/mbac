/// Product editor view.
/// ====================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Dec 27 17:42:50 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var template = require('text!pages/products/back/products/product-edit-view.html');

    return Marionette.ItemView.extend({
        ui: {
            name: '#name',
            description: '#description',
            tags: '#tags'
        },
        template: _.template(template),
        onRender: function() {
            this.ui.name.val(this.model.name());
            this.ui.tags.val(this.model.tags().join(', '));
            this.ui.description.val(this.model.description());
        }
    });
});
