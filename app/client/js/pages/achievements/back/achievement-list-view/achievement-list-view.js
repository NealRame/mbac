// Achievement list view.
// ======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Jan  6 00:18:42 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var ThumbnailList = require('ThumbnailList');
    var achievement_render = require('pages/achievements/back/achievement-list-view/achievement-thumbnail-render');
    var template = require('text!pages/achievements/back/achievement-list-view/achievement-list-view.html');

    var AchievementList = ThumbnailList.extend({
		createItemTarget: '#create',
        editable: false,
        thumbnailsRenderers: [achievement_render],
        initialize: function(options) {
            ThumbnailList.prototype.initialize.call(this, options);
        }
    });

    return Marionette.LayoutView.extend({
        initialize: function() {
            this.listView = new AchievementList({
                collection: this.collection,
                editable: true
            });
        },
        template: _.template(template),
        regions: {
            list: '#achievement-list'
        },
        onRender: function() {
            this.showChildView('list', this.listView);
        }
    });
});
