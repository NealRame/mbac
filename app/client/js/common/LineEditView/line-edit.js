// LineEdit view.
// ==============
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 17 14:57:15 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var util = require('common/util');
    var template = require('text!common/LineEditView/line-edit.html');

    return Marionette.ItemView.extend({
        className: 'row',
        ui: {
            input: '.input > input'
        },
        events: {
            'change @ui.input': 'onInputChanged'
        },
        template: _.template(template),
        initialize: function(options) {
            this.mergeOptions(options, ['inputAttribute', 'inputId', 'inputLabel']);
            if (!this.inputId) {
                this.inputId = util.randomString({prefix: 'input'});
            }
        },
        serializeData: function() {
            return {
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onInputChanged: function() {
            this.triggerMethod('input:change', this.inputAttribute, this.ui.input.val());
        }
    });
});
