define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
    var Notification = require('pages/home/notification/model');
    var NotificationView = require('pages/home/notification/view');
    var NotificationEditor = require('pages/home/notification/edit-view');

    var NotificationCollectionView = Marionette.CollectionView.extend({
        childView: NotificationView,
        childViewOptions: {
            tagName: 'li'
        }
    });

    var collection = new (Backbone.Collection.extend({
        model: Notification,
        url: '/api/home/notifications'
    }))();

    var view = new NotificationCollectionView({
        collection: collection,
        el: $('#notifications')
    });

    view.render();
    view.on('childview:edit', function(child_view, model) {
        NotificationEditor.open(model);
    });
    view.on('childview:remove', function(child_view, model) {
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
    collection.fetch();
});
