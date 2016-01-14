define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Achievement = require('pages/achievements/models/achievement');
    var AchievementEditView = require('pages/achievements/back/achievement-edit-view/achievement-edit-view');
    var AchievementListView = require('pages/achievements/back/achievement-list-view/achievement-list-view');
    var ApplicationLayout = require('pages/achievements/back/layout');
    var ApplicationMenu = require('pages/achievements/back/menu/menu');
    var async = require('common/async');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'achievements',
            'create': 'createAchievement',
            ':id': 'editAchievement'
        }
    });

    var app_channel = Backbone.Wreqr.radio.channel('app');
    var achievements = new (Backbone.Collection.extend({
        model: Achievement,
        url: '/api/achievements'
    }));

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        achievements: function(args) {
            app_channel.commands.execute('route', 'achievements', args);
            this.layout.showChildView('app', new AchievementListView({
                collection: achievements,
                model: new Achievement({}),
                router: this.router
            }));
        },
        createAchievement: function() {
            app_channel.commands.execute('route', 'editAchievement');
            this.layout.showChildView('app', new AchievementEditView({
                collection: achievements,
                model: new Achievement({}),
                router: this.router
            }));
        },
        editAchievement: function(id) {
            app_channel.commands.execute('route', 'editAchievement', id);
            this.layout.showChildView('app', new AchievementEditView({
                collection: achievements,
                model: achievements.get(id),
                router: this.router
            }));
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

    async.fetchCollection(achievements, {reset: true})
        .then(function(collection) {
            var app = new Application();
            app.start({
                achievements: collection
            });
        })
        .catch(function(err) {
            alert(err.message);
        });
});
