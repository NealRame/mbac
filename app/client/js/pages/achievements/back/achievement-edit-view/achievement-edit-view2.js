/// Achievement editor view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Jan  6 00:46:36 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
	var FormEditView = require('FormEditView');
	var RemoveBehavior = require('common/Behaviors/remove');
	var SaveBehavior = require('common/Behaviors/save');
	var async = require('common/async');
    var template = require('text!pages/achievements/back/achievement-edit-view/achievement-edit-view2.html');

    return FormEditView.extend({
		regions: {
			name: '#name',
			description: '#description',
			tags: '#tags',
			published: '#published',
			pictures: '#pictures'
		},
		behaviors: {
			remove: {
				behaviorClass: RemoveBehavior
			},
			save: {
				behaviorClass: SaveBehavior
			}
		},
		template: _.template(template),
		serializeData: function() {
			return {
				availableTags: this.collection.tags()
			};
		},
		initialize: function(options) {
			this.mergeOptions(options, 'router');
			this.edited = false;
		},
		saveModel: function() {
			var router = this.router;
			var model = this.model;
			var view = this;
			async.saveModel(this.collection.add(model).set(this.value()))
				.then(function() {
					delete view.error;
					router.navigate('#' + model.id, {
						replace: true
					});
				})
				.catch(function(err) {
					view.error = err;
				})
				.then(function() {
					view.render();
				});
		},
		removeModel: function() {
			var router = this.router;
			var view = this;
			async.destroyModel(this.model)
				.catch(function(err) {
					view.errorMessage = err.message;
					view.render();
				})
				.then(function() {
					router.navigate('#', {
						replace: true,
						trigger: true
					});
				});
		},
		onValueChanged: function() {
			this.edited = !_.isEqual(
				this.value(),
				this.model.omit('_id', '__v', 'date')
			);
		}
    });
});
