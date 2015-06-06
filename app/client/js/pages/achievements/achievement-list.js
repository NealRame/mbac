// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Mar 13 18:44:07 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
    var ThumbnailList = require('ThumbnailList');
    var achievement_render = require('pages/achievements/achievement-thumbnail-render');

    return ThumbnailList.extend({
        editable: false,
        clickBehavior: 'trigger',
        childEvents: {
            remove: 'onChildRemove'
        },
        thumbnailOptions: function() {
            return {
                removable: Marionette.getOption(this, 'editable'),
                editable: Marionette.getOption(this, 'editable'),
                clickBehavior: Marionette.getOption(this, 'clickBehavior'),
                renderers: [achievement_render]
            };
        },
        initialize: function() {
            _.bindAll(this, 'thumbnailOptions');
            ThumbnailList.prototype.initialize.call(this);
        },
        onChildEdit: function() {
        },
        onChildRemove: function(view, model) {
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
