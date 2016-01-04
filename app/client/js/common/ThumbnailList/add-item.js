/// Add item buttton view.
/// ======================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Jan  2 12:17:46 CET 2016
define(function(require) {
    'use strict';

    var Thumbnail = require('Thumbnail');
    var thumbnailBehaviors = require('common/Thumbnail/behaviors');

    return Thumbnail.extend({
        behaviors: {
            thumbLink: {
                behaviorClass: thumbnailBehaviors.click,
                event: 'add-item-click'
            }
        },
        initialize: function(options) {
            this.mergeOptions(options, ['createItemTarget']);
            this.options.editable = false;
            this.options.removable = false;
            this.options.renderers = [function() {
                return this.placeholder('add-item', this.createItemTarget);
            }];
        }
    });
});
