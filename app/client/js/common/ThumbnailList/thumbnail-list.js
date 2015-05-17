/// ThumbnailList/thumbnail-list.js
/// -------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat May 16 19:30:27 CEST 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var functional = require('common/functional');
    var ui = require('common/ui');
    var Thumbnail = require('Thumbnail');

    return Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        childEvents: {
            ready: 'onChildReady',
        },
        defaultThumbnailOptions: {
            tagName: 'li',
            rect: function() {
                if (Foundation.utils.is_small_only()) {
                    return {
                        width: 64, height: 64
                    };
                }
                if (Foundation.utils.is_medium_only()) {
                    return {
                        width: 192, height: 128
                    };
                }
                return {
                    width: 256, height: 171
                };
            }
        },
        initialize: function() {
            var ready_ = 0;
            var reflow_ = _.debounce(_.bind(function() {
                if (this.needRefresh()) {
                    ready_ = 0;
                    this.children.each(function(view) {
                        view.refresh();
                    });
                }
                this.center();
            }, this), 150);
            this.currentMediaQuery_ = ui.mediaQuery();
            this.listenTo(this, 'show', function() {
                $(window).on('resize', reflow_);
            });
            this.listenTo(this, 'destroy', function() {
                $(window).off('resize', reflow_);
            });
            this.listenTo(this, 'childview:show', reflow_);
            this.listenTo(this, 'childview:ready', function() {
                if (++ready_ >= this.collection.length) {
                    Marionette.triggerMethod.call(this, 'ready');
                }
            });
            this.listenTo(this, 'childview:click', Marionette.triggerMethod.bind(this, 'click'));
        },
        childView: Thumbnail,
        childViewOptions: function() {
            return _.defaults(
                functional.valueOf(
                    Marionette.getOption(this, 'thumbnailOptions') || {}
                ),
                this.defaultThumbnailOptions
            );
        },
        needRefresh: function() {
            var mq = ui.mediaQuery();
            if (this.currentMediaQuery_ === mq) {
                return false;
            }
            this.currentMediaQuery_ = mq;
            return true;
        },
        center: function() {
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
        },
        onReady: _.noop,
        onClick: _.noop
    });
});
