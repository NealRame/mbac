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
    var AutocompleteList = require('common/TagsEditView/autocomplete-list');

    var KEY_ENTER = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_ESC = 27;

    var Tag = Backbone.Model.extend({
        idAttribute: 'tag'
    });

    var TagList = Backbone.Collection.extend({
        model: Tag
    });

    function autocomplete(prefix, available_tags, collection) {
        return new AutocompleteList({
            collection: new Backbone.Collection(
                prefix.length > 0
                    ? _.chain(available_tags)
                        .difference(collection.pluck('tag'))
                        .filter(function(tag) {
                            return tag.startsWith(prefix);
                        })
                        .map(function(tag) {
                            return {item: tag};
                        })
                        .value()
                    : []
            )
        });
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
        childEvents: {
            'autocomplete:item:clicked': 'onAutocompleteItemClicked'
        },
        template: _.template(template),
        initialize: function(options) {
            this.tags = new TagList([]);
            this.mergeOptions(options, ['inputAttribute', 'inputAvailableTags', 'inputError', 'inputId', 'inputLabel']);
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
            this.listenTo(this.tags, 'add remove', function() {
                this.triggerMethod('changed');
            });
        },
        serializeData: function() {
            return {
                inputError: this.inputError,
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onInputChanged: function() {
            var prefix = this.ui.input.val().trim().toLowerCase();
            if (prefix) {
                this.ui.input.data('value', this.ui.input.val());
                this.showChildView(
                    'autocompleteList',
                    autocomplete(prefix, this.inputAvailableTags, this.tags)
                );
            } else {
                this.getRegion('autocompleteList').empty();
            }
        },
        onInputKeypress: function(ev) {
            var mod = ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey;
            var key_code = ev.keyCode;
            var prefix = this.ui.input.val().trim().toLowerCase();
            var region = this.getRegion('autocompleteList');

            if (!mod && (key_code === KEY_UP || key_code === KEY_DOWN)) {
                if (region.currentView) {
                    this.ui.input.val(region.currentView.next(key_code));
                }
            } else if (key_code === KEY_ESC) {
                region.empty();
                this.ui.input.val(this.ui.input.data('value'));
                this.ui.input.removeData('value');
            } else if (prefix && key_code === KEY_ENTER) {
                region.empty();
                this.tags.add({tag: prefix});
                this.ui.input.removeData();
                this.ui.input.val('');
            }
            ev.stopPropagation();
            ev.preventDefault();
        },
        onInputGainFocus: function() {
            this.ui.inputWrapper.addClass('focus');
        },
        onInputLostFocus: function() {
            this.ui.inputWrapper.removeClass('focus');
        },
        onAutocompleteItemClicked: function(view, item) {
            this.getRegion('autocompleteList').empty();
            this.tags.add({tag: item});
            this.ui.input.removeData();
            this.ui.input.val('');
        },
        onRender: function() {
            this.showChildView('tagList', new TagListView({
                collection: this.tags
            }));
            this.delegateEvents({
                'blur  @ui.input': 'onInputLostFocus',
                'focus @ui.input': 'onInputGainFocus',
                'keyup @ui.input': 'onInputKeypress',
                'input @ui.input': _.debounce(this.onInputChanged.bind(this), 200)
            });
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
            this.tags.reset(_.map(value, function(tag) {
                return {tag: tag};
            }));
        }
    });
});
