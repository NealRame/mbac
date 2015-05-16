define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var marked = require('marked');
    var ui = require('common/ui');

    var LightBox = require('LightBox');
    var Thumbnail = require('Thumbnail');
    var ThumbnailList = require('ThumbnailList');
    var AchievementBase = require('pages/achievements/achievement');

    var Achievement = AchievementBase.extend({
        urlRoot: '/api/achievements/'
    });

    var AchievementPictureList = ThumbnailList.extend({
        thumbnailsOptions: {
            rect: {
                height: 128,
                width: 192
            },
        },
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
            'pictures-list': '#pictures-wrapper',
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

    var achievement = new Achievement({
        _id: current_achievement_id()
    });

    achievement.fetch();
    achievement.once('change', function() {
        var app = new AchievementApp({
            el: $('body'),
            model: achievement
        });
        app.render();
    })
});
