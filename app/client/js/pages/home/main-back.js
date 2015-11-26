define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var functional = require('common/functional');

    var Notification = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            start: Date.now(),
            description: ''
        }
    });

    var collection = new (Backbone.Collection.extend({
        model: Notification,
        url: '/api/home/notifications'
    }))();

    collection.on('sync', function() {
        console.log(collection.toJSON());
    });
    collection.fetch();
});
