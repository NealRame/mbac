/// Form editor view.
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Feb 24 13:16:24 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
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

    return Marionette.LayoutView.extend({
        className: 'form-wrapper',
        childEvents: {
            'changed': 'onValueChanged'
        },
        value: function() {
            return _.assign.apply(
                null,
                _.map(this.regionManager.getRegions(), function(region) {
                    return region.currentView.value();
                })
            );
        },
        onShow: function() {
            _.each(this.regions, function(selector, region) {
                var el = this.$(selector).get(0);
                var View = edit_view(el.dataset.inputType);
                var child_view = new View(el.dataset);
                this.showChildView(region, child_view);
                child_view.setValue(_.result(this.model, el.dataset.inputAttribute));
            }, this);
        },
		refresh: function() {
			_.each(this.regions, function(selector, region) {
				var el = this.$(selector).get(0);
				var child_view = this.getRegion(region).currentView;
				child_view.setValue(_.result(this.model, el.dataset.inputAttribute));
			}, this);
		}
    });
});
