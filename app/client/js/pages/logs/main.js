define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    // var Dialog = require('Dialog');
    // var Menu = require('pages/home/menu/menu');
    var Log = require('pages/logs/model');
    var LogView = require('pages/logs/view');

    var LogCollectionView = Marionette.CollectionView.extend({
        childView: LogView,
        childViewOptions: {
            tagName: 'li'
        }
    });

    // var app_notification_channel = Backbone.Wreqr.radio.channel('logs');

    var App = Marionette.LayoutView.extend({
        regions: {
            'list': '#logs',
            'menu': '#logs-menu > .menu-content-wrapper'
        },
        template: false,
        initialize: function() {
            this.collection = new (Backbone.Collection.extend({
                model: Log,
                url: '/api/logs'
            }))();

            this.listView = new LogCollectionView({
                collection: this.collection,
                tagName: 'ul'
            });
            // this.menuView = new Menu();

            // this.listenTo(this.listView, 'childview:remove', function(child_view, model) {
            //     Dialog.prompt(
            //         'Êtes vous sûr de supprimer cette notification ?',
            //         {
            //             accept: function() {
            //                 model.destroy();
            //             },
            //             acceptLabel: 'Oui',
            //             refuseLabel: 'Non'
            //         }
            //     );
            // });

            this.collection.fetch({reset: true});
        },
        onRender: function() {
            this.showChildView('list', this.listView);
            // this.showChildView('menu', this.menuView);
        }
    });

    (new App({el: $('body')})).render();
});
