/// /pages/home/menu.js
/// --------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Dec  2 20:26:28 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var template = require('text!pages/home/menu/menu.html');

    var app_notification_channel = Backbone.Wreqr.radio.channel('notification');

    var MenuView = Marionette.LayoutView.extend({
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({}),
        template: _.template(template),
        ui: {
            addNotification: '#add-notification'
        },
        events: {
            'click @ui.addNotification': 'onAddNotificationClick'
        },
        onAddNotificationClick: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            app_notification_channel.commands.execute('create');
            return false;
        }
    });

    return MenuView;
});
