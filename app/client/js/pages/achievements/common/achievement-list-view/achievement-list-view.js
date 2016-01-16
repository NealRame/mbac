/// Achievement list view.
/// ======================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Jan 16 22:28:45 CET 2016
define(function(require) {
	'use strict';

    var ThumbnailList = require('ThumbnailList');
    var achievement_render = require('pages/achievements/common/achievement-list-view/achievement-thumbnail-render');

    return ThumbnailList.extend({
		createItemTarget: '#create',
        thumbnailsRenderers: [achievement_render],
        initialize: function(options) {
            ThumbnailList.prototype.initialize.call(this, options);
        }
    });
});
