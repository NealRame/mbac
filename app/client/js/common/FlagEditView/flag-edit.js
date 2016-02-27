// FlagEditView.
// =============
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Feb 18 22:28:47 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var util = require('common/util');
    var template = require('text!common/FlagEditView/flag-edit.html');

    return Marionette.ItemView.extend({
        template: _.template(template),
        className: 'row',
        ui: {
            input: '.switch > input'
        },
        events: {
            'change @ui.input': 'onInputChanged',
            'blur @ui.input': 'onInputLostFocus',
            'focus @ui.input': 'onInputGainFocus'
        },
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
            this.ui.input.parent().addClass('focus');
        },
        onInputLostFocus: function() {
            this.ui.input.parent().removeClass('focus');
        },
        value: function() {
            return _.object([
                [
                    this.inputAttribute,
                    this.ui.input.prop('checked')
                ]
            ]);
        },
        setValue: function(value) {
            this.ui.input.prop('checked', value);
        }
    });
});
