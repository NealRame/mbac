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

    return ThumbnailList.extend({
        editable: false,
        clickBehavior: 'trigger',
        childEvents: {
            remove: 'onChildRemove',
        },
        thumbnailOptions: function() {
            return {
                removable: Marionette.getOption(this, 'editable'),
                editable: Marionette.getOption(this, 'editable'),
                clickBehavior: Marionette.getOption(this, 'clickBehavior'),
                renderers: [achievement_render],
            };
        },
        initialize: function() {
            _.bindAll(this, 'thumbnailOptions');
            ThumbnailList.prototype.initialize.call(this);
        },
        onChildEdit: function(view, model) {
            console.log('-- AchievementList: edit request');
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
