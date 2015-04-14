define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var Achievement = require('pages/achievements/achievement');
    var AchievementEditorDialog = require('pages/achievements/editor');
    var AchievementList = require('pages/achievements/achievement-list');
    var AchievementMenu = require('pages/achievements/menu');

    var app_channel = Backbone.Wreqr.radio.channel('achievements');

    var AchievementApp = Marionette.LayoutView.extend({
        regions: {
            'list': '#achievements-list',
            'menu': '#achievements-menu > .menu-content-wrapper'
        },
        template: false,
        initialize: function() {
            this.collection = new (Backbone.Collection.extend({
                model: Achievement,
                url: '/api/achievements'
            }))();

            this.listView = new AchievementList({
                collection: this.collection,
                editable: true
            });
            this.menuView = new AchievementMenu({
                collection: this.collection
            });

            this.listenTo(this.collection, 'add', function(achievement) {
                AchievementEditorDialog.open(achievement);
            });
            this.listenTo(this.listView, 'childview:edit', function(view, achievement) {
                AchievementEditorDialog.open(achievement);
            });

            app_channel.commands.setHandler('filter', function(tags) {
                if (_.isEmpty(tags)) {
                    delete this.listView.filter;
                } else {
                    this.listView.filter = function(achievement) {
                        return ! _.isEmpty(_.intersection(achievement.tags(), tags));
                    };
                }
                this.listView.render();
            }, this);

            this.collection.fetch({reset: true});
        },
        onRender: function() {
            this.showChildView('list', this.listView);
            this.showChildView('menu', this.menuView);
        }
    });

    var app = new AchievementApp({
        el: $('body')
    });

    app.render();
});
