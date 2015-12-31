/// Product editor view.
/// ====================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Dec 27 17:42:50 CET 2015
define(function(require) {
	'use strict';

	var $ = require('jquery');
    var _ = require('underscore');
	var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
	var PictureList = require('PictureList');
	var functional = require('common/functional');
    var template = require('text!pages/products/back/products/product-edit-view.html');

	var app_channel = Backbone.Wreqr.radio.channel('app');

    return Marionette.LayoutView.extend({
		id: 'editor-wrapper',
        ui: {
			addPictures: '#add-pictures',
			price: '#price',
			available: '#available',
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
			this.router = options.router;
			this.productPictureList = new PictureList({
				collection: new Backbone.Collection(this.model.pictures())
			});
			this.filesInput = $(document.createElement('input')).attr({
				accept: '.gif,.jpeg,.jpg,.png',
				multiple: '',
				type: 'file'
			});

			this.listenTo(this.productPictureList, 'remove-picture', this.onInputChanged);
			this.listenTo(this.productPictureList, 'add-picture', this.onInputChanged);
			this.filesInput.on('change', (function(e) {
				this.productPictureList.addFiles(e.target.files);
			}).bind(this));

			var on_action_triggered = functional.dispatch(
				(function(cmd) {
					if (cmd === 'save') {
						this.save();
						return true;
					}
				}).bind(this),
				(function(cmd) {
					if (cmd === 'remove') {
						return true;
					}
				}).bind(this)
			);
			app_channel.commands.setHandler('product', on_action_triggered);
		},
		values: function() {
			return {
				available: this.ui.available.prop('checked'),
				description: this.ui.description.val(),
				name: this.ui.name.val(),
				pictures: this.productPictureList.collection.map(function(picture) {
					return picture.attributes
				}),
				price: Number(this.ui.price.val()),
				published: this.ui.published.prop('checked'),
				resellers: [],
				tags: this.ui.tags.val().split(',').map(function(tag) {
					return tag.trim().toLowerCase();
				})
			};
		},
		reset: function() {
			this.ui.name.val(this.model.name());
			this.ui.tags.val(this.model.tags().join(', '));
			this.ui.description.val(this.model.description());
			this.ui.available.prop('checked', this.model.available());
			this.ui.published.prop('checked', this.model.published());
			this.ui.price.val(this.model.get('price'));
			this.showChildView('pictures', this.productPictureList);
		},
		save: function() {
			if (this.edited) {
				Dialog.prompt(
					'Êtes vous sûr de vouloir sauvegarder les modificiations?',
					{
						accept: this.commit.bind(this),
						acceptLabel: 'Oui',
						refuseLabel: 'Non'
					}
				);
			}
		},
		commit: function() {
			var is_new = this.model.isNew();
			var router = this.router;
			this.collection
				.add(this.model)
				.set(this.values())
				.save()
				.then(
					function(data) {
						if (is_new) {
							router.navigate('#' + data._id, {
								replace: true
							});
						}
					},
					function(jqxhr, text_status, err) {
						// FIXME: do something
						console.error(err);
					}
				);
		},
		remove: function() {

		},
		onAddPicturesClick: function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			this.filesInput.click();
			return false;
		},
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
			this.productPictureList.$el
				.addClass('framed')
				.css({minHeight: 128});
        }
    });
});
