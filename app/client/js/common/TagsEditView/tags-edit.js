// TagsEditView.
// =============
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Feb 18 23:49:44 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var functional = require('common/functional');
    var util = require('common/util');
    var template = require('text!common/TagsEditView/tags-edit.html');
    var TagListView = require('common/TagsEditView/tag-list');
    var AutocompleteItem = require('common/TagsEditView/autocomplete-list');

    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_ESC = 27;

    function autocomplete(prefix, available_tags, collection) {
        if (prefix.length > 0) {
            return _.chain(available_tags)
                .difference(collection.pluck('tag'))
                .filter(function(tag) {
                    return tag.startsWith(prefix);
                })
                .map(function(tag) {
                    return {item: tag};
                })
                .value();
        }
        return [];
    }

    return Marionette.LayoutView.extend({
        className: 'row',
        ui: {
            input: '.input > input',
            inputWrapper: '.input'
        },
        regions: {
            tagList: '.tag-list-wrapper',
            autocompleteList: '.autocomplete-list-wrapper'
        },
        events: {
            'change @ui.input': 'onInputCommited',
            'input @ui.input': 'onInputChanged',
            'keyup @ui.input': 'onInputKeypress',
            'blur @ui.input': 'onInputLostFocus',
            'focus @ui.input': 'onInputGainFocus'
        },
        template: _.template(template),
        initialize: function(options) {
            this.tags = new Backbone.Collection([]);
            this.mergeOptions(options, ['inputAttribute', 'inputAvailableTags', 'inputId', 'inputLabel']);
            if (!functional.existy(this.inputId)) {
                this.inputId = util.randomString({
                    prefix: 'input'
                });
            }
            if (!functional.existy(this.inputAvailableTags)) {
                this.inputAvailableTags = [];
            } else {
                this.inputAvailableTags = this.inputAvailableTags.split(',');
            }
        },
        serializeData: function() {
            return {
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onInputCommited: function() {
            var tag = this.ui.input.val().trim().toLowerCase();
            if (tag.length > 0) {
                this.tags.add({tag: tag});
                this.ui.input.removeData();
                this.ui.input.val('');
                this.getRegion('autocompleteList').empty();
            }
        },
        onInputChanged: function() {
            var prefix = this.ui.input.val().trim().toLowerCase();
            if (prefix.length > 0) {
                this.ui.input.data('value', this.ui.input.val());
                this.showChildView('autocompleteList', new AutocompleteItem({
                    collection: new Backbone.Collection(autocomplete(prefix, this.inputAvailableTags, this.tags))
                }));
            } else {
                this.getRegion('autocompleteList').empty();
            }
        },
        onInputKeypress: function(ev) {
            var key_code = ev.keyCode;
            if (key_code === KEY_UP || key_code === KEY_DOWN) {
                this.ui.input.val(this.getRegion('autocompleteList').currentView.next(key_code));
                ev.stopPropagation();
                ev.preventDefault();
            } else if (key_code === KEY_ESC) {
                this.getRegion('autocompleteList').empty();
                this.ui.input.val(this.ui.input.data('value'));
                this.ui.input.removeData('value');
                ev.stopPropagation();
                ev.preventDefault();
            }
        },
        onInputGainFocus: function() {
            this.ui.inputWrapper.addClass('focus');
        },
        onInputLostFocus: function() {
            this.ui.inputWrapper.removeClass('focus');
        },
        onRender: function() {
            this.showChildView('tagList', new TagListView({
                collection: this.tags
            }));
        },
        value: function() {
            return _.object([
                [
                    this.inputAttribute,
                    this.tags.pluck('tag')
                ]
            ]);
        },
        setValue: function(value) {
            this.tags.add(_.map(value, function(tag) {
                return {tag: tag};
            }));
        }
    });
});
