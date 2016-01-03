/// Add item buttton view.
/// ======================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Jan  2 12:17:46 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var functional = require('common/functional');
    var thumbnailBehaviors = require('common/Thumbnail/behaviors');
    var template = require('text!common/ThumbnailList/add-item.html');

    return Marionette.ItemView.extend({
        behaviors: {
            thumbLink: {
                behaviorClass: thumbnailBehaviors.click,
                event: 'add-item-click'
            }
        },
        className: 'thumb',
        initialize: function(options) {
            this.mergeOptions(
                options,
                ['preventDefault', 'rect', 'stopPropagation', 'createItemTarget']
            );
        },
        serializeData: function() {
            return _.assign({
                target: this.createItemTarget
            }, functional.valueOf(this.rect));
        },
        createItemTarget: '#',
        template: _.template(template),
        ui: {
            thumbLink: '.thumb-link'
        }
    });
});
