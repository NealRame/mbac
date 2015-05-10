define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
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
            this.ready_ = 0;
            this.listenToOnce(this, 'childview:show', function() {
                this.center_();
            });

        },
        childViewOptions: function() {
            return {
                tagName: 'li',
                rect: {
                    height: 128,
                    width: 192
                }
            };
        },
        childView: Thumbnail,
        onChildReady: function() {
            if (++this.ready_ >= this.collection.length) {
                ui.pushDown($('body > footer').first(), window, 0);
            }
        },
        center_: function() {
            var child = this.children.first();
            if (child) {
                var thumb_width = child.outerRect().width;
                var container_width = ui.rect(this.el).width;
                var required_width = this.collection.length*thumb_width;
                var margin = (container_width - required_width)/2;
                this.$el.css({
                    width: required_width,
                    'margin-left': margin,
                    'margin-right': margin,
                });
            }
        }
    });

    function current_achievement_id() {
        return _.last(window.location.href.split('/'));
    }

    var AchievementApp = Marionette.LayoutView.extend({
        regions: {
            'list': '#content-wrapper',
        },
        template: false,
        initialize: function() {
            this.achievementPictureList = new AchievementPictureList({
                collection: new Backbone.Collection(this.model.pictures())
            });
            this.listenTo(this.achievementPictureList, 'childview:click', function(view) {
                LightBox.open(this.achievementPictureList.collection);
                console.log(view);
            });
        },
        onRender: function() {
            var region = this.getRegion('list');
            region.$el.empty().show();
            region.show(this.achievementPictureList);
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
