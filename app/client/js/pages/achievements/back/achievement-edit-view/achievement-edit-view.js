/// Achievement editor view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Jan  6 00:46:36 CET 2016
define(function(require) {
	'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
	var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
	var PictureList = require('PictureList');
	var async = require('common/async');
	var errors = require('common/errors');
	var functional = require('common/functional');
    var template = require('text!pages/achievements/back/achievement-edit-view/achievement-edit-view.html');

	var app_channel = Backbone.Wreqr.radio.channel('app');

    return Marionette.LayoutView.extend({
		className: 'form-wrapper',
        ui: {
			addPictures: '#add-pictures',
			error: '.error',
			inputs: 'input, textarea',
			published: '#published',
            description: '#description',
            name: '#name',
            tags: '#tags'
        },
		events: {
			'click @ui.addPictures': 'onAddPicturesClick',
			'focus @ui.inputs': 'onInputFocus',
			'blur @ui.inputs': 'onInputFocus',
			'change @ui.inputs': 'onInputChanged'
		},
		childEvents: {
			'picture:added': 'onInputChanged',
			'picture:removed': 'onInputChanged'
		},
		regions: {
			pictures: '#pictures'
		},
        template: _.template(template),
		templateHelpers: function() {
			var model = this.model;
			return {
				hasError: functional.existy(this.errorMessage),
				errorMessage: this.errorMessage,
				fieldError: function(field) {
					return functional.property(
						model,
						'validationError.reason.' + field
					) || '';
				},
				fieldIsValid: function(field) {
					return !functional.existy(functional.property(
						model,
						'validationError.reason.' + field
					));
				}
			};
		},
		initialize: function(options) {
			_.bindAll(this, 'onCommand');
			this.router = options.router;
			app_channel.commands.setHandler('achievement', this.onCommand);
		},
		reset: function() {
			this.ui.name.val(this.model.name());
			this.ui.tags.val(this.model.tags().join(', '));
			this.ui.description.val(this.model.description());
			this.ui.published.prop('checked', this.model.published());
			this.showChildView('pictures', new PictureList({
				collection: new Backbone.Collection(this.model.pictures()),
				editable: true,
				thumbnailsRect: {
					width: 192,
					height: 128
				}
			}));
		},
		values: function() {
			return {
				description: this.ui.description.val(),
				name: this.ui.name.val(),
				pictures: this.getChildView('pictures')
					.items()
					.map(function(picture) {
						return picture.attributes
					}),
				published: this.ui.published.prop('checked'),
				tags: _.compact(this.ui.tags.val().split(',').map(function(tag) {
					return tag.trim().toLowerCase();
				}))
			};
		},
		onSave: function() {
			var router = this.router;
			var model = this.model;
			var view = this;
			async.saveModel(this.collection.add(model).set(this.values()))
				.then(function() {
					delete view.errorMessage;
					router.navigate('#' + model.id, {
						replace: true
					});
				})
				.catch(function(err) {
					view.errorMessage =
						err instanceof errors.ModelValidationError
							? 'Le formulaire contient des entrées non valides.'
							: err.message;
				})
				.then(function() {
					view.render();
				});
		},
		onRemove: function() {
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
		onCommand: functional.dispatch(
			function(cmd) {
				if (cmd !== 'save') return;
				if (this.edited) {
					Dialog.prompt(
						'Êtes vous sûr de vouloir sauvegarder les modificiations?',
						{
							accept: this.triggerMethod.bind(this, 'save'),
							acceptLabel: 'Oui',
							refuseLabel: 'Non'
						}
					);
					return true;
				}
			},
			function(cmd) {
				if (cmd !== 'remove') return;
				Dialog.prompt(
					'Êtes vous sûr de vouloir supprimer cette réalisation?',
					{
						accept: this.triggerMethod.bind(this, 'remove'),
						acceptLabel: 'Oui',
						refuseLabel: 'Non'
					}
				);
				return true;
			}
		),
		onInputChanged: function() {
			this.edited = !_.isEqual(
				this.values(),
				this.model.omit('_id', '__v', 'date')
			);
		},
		onInputFocus: functional.dispatch(
			function(ev) {
				if (ev.type === 'focusin') {
					$(ev.target).parent().addClass('filled');
					return true;
				}
			},
			function(ev) {
				if (ev.type === 'focusout') {
					$(ev.target).parent().removeClass('filled');
					return true;
				}
			}
		),
        onRender: function() {
			this.reset();
			this.onInputChanged();
        }
    });
});
