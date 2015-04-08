// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Apr  8 13:05:44 CEST 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var Achievement = require('pages/achievements/achievement');
    var template = require('text!pages/achievements/menu.html');

    var channel = Backbone.Wreqr.radio.channel('global');

    var MenuView = Marionette.ItemView.extend({
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({}),
        template: _.template(template),
        ui: {
            addAchievement: '#add-achievement',
            filterAchievement: '#filter-achievement'
        },
        events: {
            'click  @ui.addAchievement': 'onAddAchievementClick',
            'click  @ui.filterAchievement': 'onFilterAchievementClick'
        },
        onAddAchievementClick: function(ev) {
            console.log('-- achievement::menu::onAddAchievementClick');
            ev.preventDefault();
            ev.stopPropagation();
            this.collection.add(new Achievement());
            return false;
        },
        onFilterAchievementClick: function(ev) {
            console.log('-- achievement::menu::onFilterAchievementClick');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    });

    return MenuView;
});
