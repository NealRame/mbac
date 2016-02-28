// LineEditView.
// =============
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
            input: '.input > input',
            inputWrapper: '.input'
        },
        events: {
            'change @ui.input': 'onInputChanged',
            'blur @ui.input': 'onInputLostFocus',
            'focus @ui.input': 'onInputGainFocus'
        },
        template: _.template(template),
        initialize: function(options) {
            this.mergeOptions(options, ['inputAttribute', 'inputError', 'inputId', 'inputLabel']);
            if (!this.inputId) {
                this.inputId = util.randomString({
                    prefix: 'input'
                });
            }
        },
        serializeData: function() {
            return {
                inputError: this.inputError,
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onInputChanged: function() {
            this.triggerMethod('changed');
        },
        onInputGainFocus: function() {
            this.ui.inputWrapper.addClass('focus');
        },
        onInputLostFocus: function() {
            this.ui.inputWrapper.removeClass('focus');
        },
        value: function() {
            return _.object([
                [
                    this.inputAttribute,
                    this.ui.input.val()
                ]
            ]);
        },
        setValue: function(value) {
            this.ui.input.val(value);
        }
    });
});
