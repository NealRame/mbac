/// Add item buttton view.
/// ======================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Jan  2 12:17:46 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var functional = require('common/functional');
    var template = require('text!common/ThumbnailList/add-item.html');

    return Marionette.ItemView.extend({
        className: 'thumb',
        initialize: function(options) {
            this.mergeOptions(
                options,
                ['preventDefault', 'rect', 'stopPropagation', 'target']
            );
        },
        serializeData: function() {
            return _.assign({
                target: this.target
            }, functional.valueOf(this.rect));
        },
        preventDefault: true,
        stopPropagation: true,
        target: '#',
        template: _.template(template),
        triggers: function() {
            return {
                'click @ui.addItem': {
                    event: 'add-item-request',
                    preventDefault: this.preventDefault,
                    stopPropagation: this.stopPropagation
                }
            };
        },
        ui: {
            addItem: '.add-item'
        }
    });
});
