/// pages/home/notification/view.js
/// -------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Nov 28 00:29:02 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var itemTemplate = require('text!pages/home/notification/view.html');
    var Marionette = require('marionette');

    return Marionette.ItemView.extend({
        className: 'notification',
        ui: {
            action: '.action'
        },
        events: {
            'click @ui.action': 'onActionRequested'
        },
        template: _.template(itemTemplate),
        serializeData: function() {
            return {
                text: this.model.text()
            };
        },
        onActionRequested: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger($(e.currentTarget).attr('data-action'), this.model);
            return false;
        }
    });
});
