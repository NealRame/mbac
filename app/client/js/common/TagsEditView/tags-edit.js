// TagsEditView.
// =============
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Feb 18 23:49:44 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var util = require('common/util');
    var template = require('text!common/TagsEditView/tags-edit.html');

    return Marionette.LayoutView.extend({
        className: 'row',
        ui: {
            input: '.input > input',
            inputWrapper: '.input'
        },
        regions: {
            tagList: '.tag-list-wrapper'
        },
        events: {
            'change @ui.input': 'onInputChanged',
            'blur @ui.input': 'onInputLostFocus',
            'focus @ui.input': 'onInputGainFocus'
        },
        template: _.template(template),
        initialize: function(options) {
            this.mergeOptions(options, ['inputAttribute', 'inputId', 'inputLabel']);
            if (!this.inputId) {
                this.inputId = util.randomString({
                    prefix: 'input'
                });
            }
        },
        serializeData: function() {
            return {
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
                    []
                ]
            ]);
        },
        setValue: function(value) {
            this.ui.input.val(value);
        }
    });
});
