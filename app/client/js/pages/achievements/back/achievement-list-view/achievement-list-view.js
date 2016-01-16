// Achievement list view.
// ======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Jan  6 00:18:42 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
	var AchievementList = require('pages/achievements/common/achievement-list-view/achievement-list-view');
    var template = require('text!pages/achievements/back/achievement-list-view/achievement-list-view.html');

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
