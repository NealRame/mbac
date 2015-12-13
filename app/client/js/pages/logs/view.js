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
    var functional = require('common/functional');

    return Marionette.ItemView.extend({
        className: 'log',
        ui: {
            action: '.action',
            stack: '.stack'
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
                hasStack: this.model.hasStack.bind(this.model),
                stack: this.model.stack.bind(this.model),
                hasStatus: this.model.hasStatus.bind(this.model),
                status: this.model.status.bind(this.model),
                hasUrl: this.model.hasUrl.bind(this.model),
                url: this.model.url.bind(this.model),
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
            var target = $(e.currentTarget);
            switch (target.attr('data-action')) {
                case 'unfold':
                    target.attr('data-action', 'fold-up');
                    this.ui.stack.attr('data-fold', 'no');
                    break;
                case 'fold-up':
                    target.attr('data-action', 'unfold');
                    this.ui.stack.attr('data-fold', 'yes');
                    break;
                default:
                    this.trigger($(e.currentTarget).attr('data-action'), this.model);
                    break;
            }
            return false;
        }
    });
});
