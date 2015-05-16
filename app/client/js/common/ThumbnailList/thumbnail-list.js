/// ThumbnailList/thumbnail-list.js
/// -------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat May 16 19:30:27 CEST 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var marked = require('marked');
    var ui = require('common/ui');

    var Thumbnail = require('Thumbnail');

    function center() {
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
    }

    var ThumbnailList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        childEvents: {
            ready: 'onChildReady',
        },
        initialize: function() {
            var ready_ = 0;
            var center_ = _.debounce(_.bind(center, this), 150);
            this.listenTo(this, 'show', function() {
                $(window).on('resize', center_);
            });
            this.listenTo(this, 'destroy', function() {
                $(window).off('resize', center_);
            });
            this.listenTo(this, 'childview:ready', function() {
                if (++ready_ >= this.collection.length) {
                    Marionette.triggerMethod('ready');
                }
            });
            this.listenTo(this, 'childview:show', center_);
            this.listenTo(this, 'childview:click', Marionette.triggerMethod.bind(this, 'click'));
        },
        childView: Thumbnail,
        childViewOptions: function() {
            var thumbnail_options = Marionette.getOption(this, 'thumbnailOptions');
            if (_.isFunction(thumbnail_options)) {
                thumbnail_options = thumbnail_options.call(this);
            }
            return _.defaults(thumbnail_options || {}, {tagName: 'li'});
        },
        onReady: _.noop,
        onClick: _.noop
    });

    return ThumbnailList;
});
