define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var ui = require('common/ui');

    var Achievement = require('pages/achievements/achievement');
    var AchievementList = require('pages/achievements/achievement-list');

    $('ul.achievements').empty();

    var AchievementApp = Marionette.LayoutView.extend({
        regions: {
            'list': 'ul.achievements',
        },
        template: false,
        initialize: function() {
            this.collection = new (Backbone.Collection.extend({
                model: Achievement,
                url: '/api/achievements'
            }))();
            this.listView = new AchievementList({
                collection: this.collection
            });
            this.listenTo(this.listView, 'ready', function() {
                ui.pushDown($('body > footer').first(), window, 0);
            });
            this.collection.fetch({reset: true});
        },
        onRender: function() {
            this.showChildView('list', this.listView);
        }
    });

    var app = new AchievementApp({
        el: $('body')
    });

    app.render();
});
