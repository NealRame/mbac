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
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        serializeData: function() {
            return {
                message: this.model.message(),
                published: this.model.published(),
                state: this.model.active() ? 'active':'inactive',
                startDate: this.model.startDateString(),
                endDate: this.model.endDateString()
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
