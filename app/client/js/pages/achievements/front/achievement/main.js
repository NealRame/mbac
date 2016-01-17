define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var LightBox = require('LightBox');
    var ThumbnailList = require('ThumbnailList');
    var AchievementBase = require('pages/achievements/common/models/achievement');

    var async = require('common/async');
    var marked = require('marked');
    var ui = require('common/ui');

    var Achievement = AchievementBase.extend({
        urlRoot: '/api/achievements/'
    });

    var AchievementPictureList = ThumbnailList.extend({
        initialize: function() {
            ThumbnailList.prototype.initialize.call(this);
        },
        onClick: function(thumbnail) {
            LightBox.open(this.collection, thumbnail._index);
        },
        onReady: function() {
            ui.pushDown($('body > footer').first(), window, 0);
        }
    });

    function current_achievement_id() {
        return _.last(window.location.pathname.split('/'));
    }

    var AchievementApp = Marionette.LayoutView.extend({
        regions: {
            'pictures-list': '#pictures-wrapper'
        },
        ui: {
            description: '#description-wrapper'
        },
        template: false,
        initialize: function() {
            this.achievementPictureList = new AchievementPictureList({
                collection: new Backbone.Collection(this.model.pictures())
            });
        },
        onRender: function() {
            var region = this.getRegion('pictures-list');
            region.$el.empty().show();
            region.show(this.achievementPictureList);
            this.ui.description
                .empty()
                .html(marked(this.model.description(), {headerPrefix: '__'}))
                .show();
        }
    });

    async.fetchModel(new Achievement({
        _id: current_achievement_id()
    })).then(function(achievement) {
        var app = new AchievementApp({
            el: $('body'),
            model: achievement
        });
        app.render();
    }).catch(function(err) {
        console.error(err);
    });
});
