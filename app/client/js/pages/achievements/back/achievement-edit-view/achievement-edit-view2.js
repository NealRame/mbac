/// Achievement editor view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Jan  6 00:46:36 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
	var Backbone = require('backbone');
    var Marionette = require('marionette');
    // var Dialog = require('Dialog');
	var functional = require('common/functional');
    var template = require('text!pages/achievements/back/achievement-edit-view/achievement-edit-view2.html');

	var FlagEditView = require('FlagEditView');
	var LineEditView = require('LineEditView');
	var PictureListEditView = require('PictureListEditView');
	var TagsEditView = require('TagsEditView');
	var TextEditView = require('TextEditView');

	var app_channel = Backbone.Wreqr.radio.channel('app');

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
		regions: {
			name: '#name',
			description: '#description',
			tags: '#tags',
			published: '#published',
			pictures: '#pictures'
		},
		childEvents: {
			'changed': 'onValueChanged'
		},
		template: _.template(template),
		initialize: function(options) {
			_.bindAll(this, 'onCommand');
			this.router = options.router;
			app_channel.commands.setHandler('achievement', this.onCommand);
		},
		serializeData: function() {
			return {
				availableTags: this.collection.tags()
			};
		},
		onCommand: function(cmd) {
			console.log(cmd);
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
		}
    });
});
