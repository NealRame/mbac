/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 23:28:36 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
    var ThumbnailList = require('ThumbnailList');
    var product_render = require('pages/products/back/products/product-thumbnail-render');
    var template = require('text!pages/products/back/products/product-list-view.html');

    var ProductList = ThumbnailList.extend({
        editable: false,
        clickBehavior: 'trigger',
        childEvents: {
            remove: 'onChildRemove'
        },
        thumbnailOptions: function() {
            return {
                removable: Marionette.getOption(this, 'editable'),
                editable: Marionette.getOption(this, 'editable'),
                clickBehavior: Marionette.getOption(this, 'clickBehavior'),
                renderers: [product_render]
            };
        },
        initialize: function() {
            _.bindAll(this, 'thumbnailOptions');
            ThumbnailList.prototype.initialize.call(this);
        },
        onChildEdit: function() {
        },
        onChildRemove: function(view, model) {
            Dialog.prompt(
                'Êtes vous sûr de supprimer cette réalisation ?',
                {
                    accept: function() {
                        model.destroy();
                    },
                    acceptLabel: 'Oui',
                    refuseLabel: 'Non'
                }
            );
        }
    });

    return Marionette.LayoutView.extend({
        initialize: function() {
            this.listView = new ProductList({
                collection: this.collection,
                editable: true,
                clickBehavior: 'default'
            });
        },
        template: _.template(template),
        regions: {
            list: '#product-list'
        },
        onRender: function() {
            this.showChildView('list', this.listView);
        }
    });
});
