define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var AchievementEditView = require('pages/achievements/back/achievement-edit-view/achievement-edit-view');
    var ApplicationLayout = require('pages/achievements/back/layout');
    var ApplicationMenu = require('pages/achievements/back/menu/menu');
    var Achievement = require('pages/achievements/common/models/achievement');
    var AchievementListView = require('pages/achievements/back/achievement-list-view/achievement-list-view');
    var async = require('common/async');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'achievements',
            'create': 'createAchievement',
            ':id': 'editAchievement'
        }
    });

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        achievements: function(args) {
            this.layout.showChildView('app', new AchievementListView({
                collection: this.config.collection,
                router: this.router
            }));
            app_channel.commands.execute('route', 'achievements', args);
        },
        createAchievement: function() {
            this.layout.showChildView('app', new AchievementEditView({
                collection: this.config.collection,
                model: new Achievement({}),
                router: this.router
            }));
            app_channel.commands.execute('route', 'editAchievement');
        },
        editAchievement: function(id) {
            this.layout.showChildView('app', new AchievementEditView({
                collection: this.config.collection,
                model: this.config.collection.get(id),
                router: this.router
            }));
            app_channel.commands.execute('route', 'editAchievement', id);
        },
        onStart: function(config) {
            this.config = config;
            this.layout.showChildView('menu', new ApplicationMenu());
            this.router = new ApplicationRouter({
                controller: this
            });
            Backbone.history.start();
        }
    });

    var AchievementCollectionProto = {
        model: Achievement,
        url: '/api/achievements',
        tags: function() {
            return _.union.apply(null, _.compact(this.pluck('tags')));
        }
    };

    async.fetchCollection(AchievementCollectionProto, {reset: true})
        .then(function(collection) {
            var app = new Application();
            app.start({collection: collection});
            app_channel.commands.setHandler('achievement', function(cmd) {
                var current_view = app.layout.getRegion('app').currentView;
                current_view.triggerMethod(cmd);
                return true;
            });
        })
        .catch(function(err) {
            console.error(err);
            // alert(err.message);
        });
});
