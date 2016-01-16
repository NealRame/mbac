define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var AchievementEditView = require('pages/achievements/back/achievement-edit-view/achievement-edit-view');
    var ApplicationLayout = require('pages/achievements/back/layout');
    var ApplicationMenu = require('pages/achievements/back/menu/menu');
    var Achievement = require('pages/achievements/models/achievement');
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
            app_channel.commands.execute('route', 'achievements', args);
            this.layout.showChildView('app', new AchievementListView({
                collection: this.config.collection,
                router: this.router
            }));
        },
        createAchievement: function() {
            app_channel.commands.execute('route', 'editAchievement');
            this.layout.showChildView('app', new AchievementEditView({
                collection: this.config.collection,
                model: new Achievement({}),
                router: this.router
            }));
        },
        editAchievement: function(id) {
            app_channel.commands.execute('route', 'editAchievement', id);
            this.layout.showChildView('app', new AchievementEditView({
                collection: this.config.collection,
                model: this.config.collection.get(id),
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

    async.fetchCollection({
        model: Achievement,
        url: '/api/achievements'
    }, {reset: true})
        .then(function(collection) {
            var app = new Application();
            app.start({
                collection: collection
            });
        })
        .catch(function(err) {
            alert(err.message);
        });
});
