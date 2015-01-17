// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var template = require('text!common/AchievementLightbox/achievement-lightbox.template.html');

    return Marionette.ItemView.extend({
        className: 'achievement-lightbox',
        template: _.template(template),
        onRender: function() {
        },
    });
});
