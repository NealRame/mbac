define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var marked = require('marked');
    var ui = require('common/ui');

    var LightBox = require('LightBox');
    var Thumbnail = require('Thumbnail');
    var AchievementBase = require('pages/achievements/achievement');

    var Achievement = AchievementBase.extend({
        urlRoot: '/api/achievements/'
    });

    var AchievementPictureList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        childEvents: {
            ready: 'onChildReady',
        },
        initialize: function() {
            var center = _.bind(function() {
                var child = this.children.first();
                if (child) {
                    this.$el.removeAttr('style');
                    var container_width = ui.rect(this.el).width;
                    var thumb_width = child.outerRect().width;
                    var thumb_count_by_row = Math.min(
                        this.collection.length,
                        Math.floor(container_width/thumb_width)
                    );
                    this.$el.css({
                        width: thumb_count_by_row*thumb_width,
                    });
                }
            }, this);
            this.ready_ = 0;
            this.listenToOnce(this, 'childview:show', function() {
                $(window).bind('resize', _.debounce(center, 150));
                center();
            });
            this.listenTo(this, 'childview:click', function(view) {
                LightBox.open(this.collection, view._index);
            });
        },
        childView: Thumbnail,
        childViewOptions: function() {
            return {
                tagName: 'li',
                rect: {
                    height: 128,
                    width: 192
                }
            };
        },
        onChildReady: function() {
            if (++this.ready_ >= this.collection.length) {
                ui.pushDown($('body > footer').first(), window, 0);
            }
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
