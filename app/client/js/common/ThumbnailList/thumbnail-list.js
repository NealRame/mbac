/*global Foundation */
/// ThumbnailList/thumbnail-list.js
/// -------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat May 16 19:30:27 CEST 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Marionette = require('marionette');
    var ui = require('common/ui');
    var Thumbnail = require('Thumbnail');
    var AddItemView = require('common/ThumbnailList/add-item');

    return Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        createItemTarget: '#',
        thumbnailsClickBehavior: 'default',
        thumbnailsTagName: 'li',
        thumbnailsRect: function() {
            if (Foundation.utils.is_small_only()) {
                return {
                    width: 96, height: 96
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
        },
        thumbnailsRenderers: [],
        editable: false,
        initialize: function(options) {
            var ready = 0;
            var reflow = _.debounce(_.bind(function() {
                if (this.needRefresh()) {
                    ready = 0;
                    this.children.each(function(view) {
                        view.refresh();
                    });
                }
                this.center();
            }, this), 150);
            this.mergeOptions(options, ['editable', 'rect']);
            this.currentMediaQuery = ui.mediaQuery();
            this.listenTo(this, 'show', function() {
                $(window).on('resize', reflow);
            });
            this.listenTo(this, 'destroy', function() {
                $(window).off('resize', reflow);
            });
            this.listenTo(this, 'childview:show', reflow);
            this.listenTo(this, 'childview:ready', function() {
                if (++ready >= this.collection.length) {
                    this.triggerMethod('thumbnail-list:ready');
                }
            });
            if (Marionette.getOption(this, 'editable')) {
                this.addItemView = new AddItemView(this.childViewOptions());
                this.listenTo(this.addItemView, 'add-item-click', function() {
                    this.triggerMethod('addItemClicked');
                });
            }
        },
        childView: Thumbnail,
        childViewOptions: function() {
            return {
                clickBehavior: Marionette.getOption(this, 'thumbnailsClickBehavior'),
                createItemTarget: Marionette.getOption(this, 'createItemTarget'),
                editable: Marionette.getOption(this, 'editable'),
                rect: Marionette.getOption(this, 'thumbnailsRect'),
                removable: Marionette.getOption(this, 'editable'),
                renderers: Marionette.getOption(this, 'thumbnailsRenderers'),
                tagName: Marionette.getOption(this, 'thumbnailsTagName')
            };
        },
        needRefresh: function() {
            var mq = ui.mediaQuery();
            if (this.currentMediaQuery === mq) {
                return false;
            }
            this.currentMediaQuery = mq;
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
                    width: thumb_count_by_row*thumb_width
                });
            }
        },
        items: function() {
            return this.collection.models;
        },
        onReady: _.noop,
        onRender: function() {
            if (this.addItemView) {
                this.$el.append(this.addItemView.render().el);
                this.addItemView.onShow();
            }
        }
    });
});
