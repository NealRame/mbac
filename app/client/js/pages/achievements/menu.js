// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Apr  8 13:05:44 CEST 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var template = require('text!pages/achievements/menu.html');

    var MenuView = Marionette.ItemView.extend({
        tagName: 'ul',
        className: 'side-nav',
        template: _.template(template),
    });

    return MenuView;
});
