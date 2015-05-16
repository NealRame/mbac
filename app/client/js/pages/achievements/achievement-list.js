// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Mar 13 18:44:07 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var functional = require('common/functional');
    var ui = require('common/ui');

    // var AchievementEditorDialog = require('AchievementEditorDialog');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');
    var ThumbnailList = require('ThumbnailList');
    var achievement_render = require('pages/achievements/achievement-thumbnail-render');

    function is_model_filterable(model) {
        return true;
    }

    return Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        editable: false,
        clickBehavior: 'trigger',
        childView: Thumbnail,
        childEvents: {
            edit: 'onChildEdit',
            ready: 'onChildReady',
            remove: 'onChildRemove',
        },
        childViewOptions: function() {
            return {
                tagName: 'li',
                removable: Marionette.getOption(this, 'editable'),
                editable: Marionette.getOption(this, 'editable'),
                clickBehavior: Marionette.getOption(this, 'clickBehavior'),
                renderers: [achievement_render]
            };
        },
        initialize: function() {
            this.ready_ = 0;
            var resize_cb = _.debounce(this.center_.bind(this), 150);
            this.listenTo(this, 'show', function() {
                $(window).on('resize', resize_cb);
            });
            this.listenTo(this, 'destroy', function() {
                $(window).off('resize', resize_cb);
            });
            this.listenToOnce(this, 'childview:show', function() {
                resize_cb();
            });
        },
        onChildEdit: function(view, model) {
            console.log('-- AchievementList: edit request');
            // AchievementEditorDialog.open(model);
        },
        onChildReady: function() {
            if (++this.ready_ >= this.collection.length) {
                this.trigger('ready');
            }
        },
        onChildRemove: function(view, model) {
            console.log('-- AchievementList: remove request');
            Dialog.prompt(
                'Êtes vous sûr de supprimer cette réalisation ?',
                {
                    accept: function() {
                        model.destroy();
                    },
                    acceptLabel: 'Oui',
                    refuseLabel: 'Non'
                }
            );
        },
        center_: function() {
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
    });
});
