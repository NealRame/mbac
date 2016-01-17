define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Marionette = require('marionette');
    var Achievement = require('pages/achievements/common/models/achievement');
    var AchievementListView = require('pages/achievements/common/achievement-list-view/achievement-list-view');
    var async = require('common/async');
    var ui = require('common/ui');

    var Layout = Marionette.LayoutView.extend({
        regions: {
            'list': '#achievements-wrapper'
        },
        childEvents: {
            'thumbnail-list:ready': function() {
                ui.pushDown($('body > footer').first(), window, 0);
            }
        },
        template: false,
        onRender: function() {
            var region = this.getRegion('list');
            region.$el.empty().show();
            region.show(new AchievementListView({
                collection: this.collection
            }));
        }
    });

    async.fetchCollection({
        model: Achievement,
        url: '/api/achievements'
    }, {reset: true})
        .then(function(collection) {
            var layout = new Layout({
                collection: collection,
                el: 'body'
            });
            layout.render();
        });
});
