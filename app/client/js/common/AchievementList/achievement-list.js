// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Mar 13 18:44:07 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var functional = require('utils/functional');
    var ui = require('utils/ui');

    var AchievementEditorDialog = require('AchievementEditorDialog');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');

    function is_model_filterable(model) {
        return true;
    }

    return Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        editable: false,
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
            };
        },
        filter: function(tags) {
            this.children.each(function(child) {
                if (tags.length === 0 || child.model.hasTags(tags)) {
                    child.$el.fadeIn('fast');
                } else {
                    child.$el.fadeOut('fast');
                }
            });
        },
        initialize: function() {
            this.ready_ = 0;
            var resize_cb = _.debounce(this.center_.bind(this), 50);
            this.listenTo(this, 'show', function() {
                $(window).on('resize', resize_cb);
            });
            this.listenTo(this, 'destroy', function() {
                $(window).off('resize', resize_cb);
            });
            this.listenToOnce(this, 'childview:show', function() {
                console.log('show a child');
                this.center_();
            });
        },
        onChildEdit: function(view, model) {
            console.log('-- AchievementList: edit request');
            AchievementEditorDialog.open(model);
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
                var thumb_width = child.outerRect().width;
                var container_width = ui.rect(this.el).width - 2;

                // how many thumb can we have per row ?
                var count = Math.floor(container_width/thumb_width);

                // deduce padding to center thumb in the container view
                var padding = (container_width - count*thumb_width)/2;

                this.$el.css({
                    'padding-left': padding,
                    'padding-right': padding
                });
            }
        },
    });
});
