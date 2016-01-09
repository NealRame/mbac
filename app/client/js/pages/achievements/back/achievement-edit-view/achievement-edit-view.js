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
	var functional = require('common/functional');
    var template = require('text!pages/achievements/back/achievement-edit-view/achievement-edit-view.html');

	var app_channel = Backbone.Wreqr.radio.channel('app');

    return Marionette.LayoutView.extend({
		className: 'form-wrapper',
        ui: {
			addPictures: '#add-pictures',
			price: '#price',
			published: '#published',
            description: '#description',
            name: '#name',
            tags: '#tags',
			inputs: 'input, textarea'
        },
		events: {
			'click @ui.addPictures': 'onAddPicturesClick',
			'focus @ui.inputs': 'onInputFocus',
			'blur @ui.inputs': 'onInputFocus',
			'change @ui.inputs': 'onInputChanged'
		},
		regions: {
			pictures: '#pictures'
		},
        template: _.template(template),
		initialize: function(options) {
			_.bindAll(this, 'onCommand');
			this.router = options.router;
			this.achievementPictureList = new PictureList({
				collection: new Backbone.Collection(this.model.pictures()),
				editable: true
			});
			this.listenTo(this.achievementPictureList, 'remove-picture', this.onInputChanged);
			this.listenTo(this.achievementPictureList, 'add-picture', this.onInputChanged);
			app_channel.commands.setHandler('achievement', this.onCommand);
		},
		values: function() {
			return {
				description: this.ui.description.val(),
				name: this.ui.name.val(),
				pictures: this.achievementPictureList
					.items()
					.map(function(picture) {
						return picture.attributes
					}),
				published: this.ui.published.prop('checked'),
				tags: this.ui.tags.val().split(',').map(function(tag) {
					return tag.trim().toLowerCase();
				})
			};
		},
		reset: function() {
			this.ui.name.val(this.model.name());
			this.ui.tags.val(this.model.tags().join(', '));
			this.ui.description.val(this.model.description());
			this.ui.published.prop('checked', this.model.published());
			this.showChildView('pictures', this.achievementPictureList);
		},
		saveAchievement: function() {
			var commit = function() {
				var router = this.router;
				var model = this.model;
				var values = this.values();
				async.synchroniseModel(this.collection.add(model).set(values))
					.catch(function(err) {
						// FIXME: do something
						console.error(err);
					})
					.then(function() {
						router.navigate('#' + model.id, {
							replace: true
						});
					})
			};
			if (this.edited) {
				Dialog.prompt(
					'Êtes vous sûr de vouloir sauvegarder les modificiations?',
					{
						accept: commit.bind(this),
						acceptLabel: 'Oui',
						refuseLabel: 'Non'
					}
				);
			}
		},
		removeAchievement: function() {
			var commit = function() {
				var router = this.router;
				async.destroyModel(this.model)
					.catch(function(err) {
						// FIXME: do something
						console.error(err);
					})
					.then(function() {
						router.navigate('#', {
							replace: true,
							trigger: true
						});
					});
			}
			Dialog.prompt(
				'Êtes vous sûr de vouloir supprimer cette réalisation?',
				{
					accept: commit.bind(this),
					acceptLabel: 'Oui',
					refuseLabel: 'Non'
				}
			);
		},
		onCommand: functional.dispatch(
			function(cmd) {
				if (cmd === 'save') {
					this.saveAchievement();
					return true;
				}
			},
			function(cmd) {
				if (cmd === 'remove') {
					this.removeAchievement();
					return true;
				}
			}
		),
		onInputChanged: function() {
			this.edited = !_.isEqual(
				this.values(),
				_.omit(this.model.attributes, '_id', '__v', 'date')
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
