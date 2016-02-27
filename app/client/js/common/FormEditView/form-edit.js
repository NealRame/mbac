/// Form editor view.
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Feb 24 13:16:24 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
	var errors = require('common/errors');
    var functional = require('common/functional');

    var FlagEditView = require('FlagEditView');
    var LineEditView = require('LineEditView');
    var PictureListEditView = require('PictureListEditView');
    var TagsEditView = require('TagsEditView');
    var TextEditView = require('TextEditView');

    var edit_view = functional.dispatch(
        function(type) {
            if (type === 'flag') {
                return FlagEditView;
            }
        },
        function(type) {
            if (type === 'line') {
                return LineEditView;
            }
        },
        function(type) {
            if (type === 'picture-list') {
                return PictureListEditView;
            }
        },
        function(type) {
            if (type === 'tags') {
                return TagsEditView;
            }
        },
        function(type) {
            if (type === 'text') {
                return TextEditView;
            }
        }
    );

	function attribute_error_message(error, attr) {
		var message = functional.property(error || {}, 'reason.' + attr);
		if (functional.existy(message)) {
			return {inputError: message};
		}
		return {};
	}

    return Marionette.LayoutView.extend({
        className: 'form-wrapper',
        childEvents: {
            'changed': 'onValueChanged'
        },
		templateHelpers: function() {
			var view = this;
			return {
				hasError: function() {
					return functional.existy(view.error);
				},
				errorMessage: function() {
					return (
						view.error instanceof errors.ModelValidationError
							? 'Le formulaire contient des entrées non valides.'
							: view.error.message
					);
				}
			};
		},
        value: function() {
            return _.assign.apply(
                null,
                _.map(this.regionManager.getRegions(), function(region) {
                    return region.currentView.value();
                })
            );
        },
        onRender: function() {
            _.each(this.regions, function(selector, region) {
                var el = this.$(selector).get(0);
                var View = edit_view(el.dataset.inputType);
				var attr = el.dataset.inputAttribute;
                var child_view = new View(_.assign(
					el.dataset,
					attribute_error_message(this.error, attr)
				));
                this.showChildView(region, child_view);
                child_view.setValue(_.result(this.model, attr));
            }, this);
        }
    });
});
