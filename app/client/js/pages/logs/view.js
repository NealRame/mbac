/// /client/js/pages/home/notification/view.js
/// ------------------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 12 21:51:46 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var itemTemplate = require('text!pages/logs/view.html');
    var Marionette = require('marionette');

    return Marionette.ItemView.extend({
        className: 'log',
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
        templateHelpers: function() {
            return {
                hasUrl: this.model.hasUrl.bind(this.model),
                url: this.model.url.bind(this.model),
                hasStatus: this.model.hasStatus.bind(this.model),
                status: this.model.status.bind(this.model),
                date: function() {
                    return (new Date(this.timestamp)).toLocaleDateString('FR-fr');
                },
                time: function() {
                    return (new Date(this.timestamp)).toLocaleTimeString('FR-fr');
                }
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
