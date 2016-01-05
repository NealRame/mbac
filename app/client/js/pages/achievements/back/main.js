define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Achievement = require('pages/achievements/models/achievement');
    var ApplicationLayout = require('pages/achievements/back/layout');
    var ApplicationMenu = require('pages/achievements/back/menu/menu');
    var Promise = require('promise');

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
        },
        createAchievement: function() {
            app_channel.commands.execute('route', 'editAchievement');
        },
        editAchievement: function(id) {
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

    var app = new Application();

    (new Promise(function(resolve, reject) {
        achievements.fetch({
            reset: true,
            success: resolve,
            error: function(collection, res) {
                reject(res);
            }
        });
    }))
    .then(function(collection) {
        app.start({
            achievements: collection
        });
    })
    .catch(function(err) {
        console.error(err);
    });

});
