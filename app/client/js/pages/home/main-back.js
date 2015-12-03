define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
    var Menu = require('pages/home/menu/menu');
    var Notification = require('pages/home/notification/model');
    var NotificationView = require('pages/home/notification/view');
    var NotificationEditor = require('pages/home/notification/edit-view');

    var NotificationCollectionView = Marionette.CollectionView.extend({
        childView: NotificationView,
        childViewOptions: {
            tagName: 'li'
        }
    });

    var app_notification_channel = Backbone.Wreqr.radio.channel('notification');

    var App = Marionette.LayoutView.extend({
        regions: {
            'list': '#notifications',
            'menu': '#home-menu > .menu-content-wrapper'
        },
        template: false,
        initialize: function() {
            this.collection = new (Backbone.Collection.extend({
                model: Notification,
                url: '/api/home/notifications'
            }))();

            this.listView = new NotificationCollectionView({
                collection: this.collection,
                tagName: 'ul'
            });
            this.menuView = new Menu();

            this.listenTo(this.collection, 'add', function(notification) {
                NotificationEditor.open(notification);
            });

            this.listenTo(this.listView, 'childview:edit', function(view, notification) {
                NotificationEditor.open(notification);
            });
            this.listenTo(this.listView, 'childview:remove', function(child_view, model) {
                Dialog.prompt(
                    'Êtes vous sûr de supprimer cette notification ?',
                    {
                        accept: function() {
                            model.destroy();
                        },
                        acceptLabel: 'Oui',
                        refuseLabel: 'Non'
                    }
                );
            });

            app_notification_channel.commands.setHandler('create', function() {
                this.collection.add(new Notification());
            }, this);

            this.collection.fetch({reset: true});
        },
        onRender: function() {
            this.showChildView('list', this.listView);
            this.showChildView('menu', this.menuView);
        }
    });

    (new App({el: $('body')})).render();
});
