// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Mar 13 18:44:07 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var AchievementEditorDialog = require('AchievementEditorDialog');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');

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
        }
    });
});
