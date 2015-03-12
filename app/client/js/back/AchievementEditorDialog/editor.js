// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 18 21:40:04 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var configuration = require('Configuration');

    var Achievement = require('Achievement');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');

    var editorTemplate = require('text!back/AchievementEditorDialog/editor.html');
    var listAddTemplate = require('text!back/AchievementEditorDialog/list-add.html');

    var AddItemButton = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'thumb',
        ui: {
            addButton: '.add-thumb'
        },
        triggers: {
            'click @ui.addButton': 'click'
        },
        title: '',
        serializeData: function() {
            var height = this.options.height;
            var width = this.options.width;
            var font_size = Math.max(8, Math.min(width, height) - 32);
            return {
                width: width,
                height: height,
                fontSize: font_size,
                left: (width - font_size)/2,
                top: (height - font_size)/2,
                title: Marionette.getOption(this, 'title')
            };
        },
        template: _.template(listAddTemplate),
    });

    var AchievementPictureList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        thumbnailHeight: 131,
        thumbnailWidth: 196,
        childViewOptions: function() {
            return {
                tagName: 'li',
                width: Marionette.getOption(this, 'thumbnailWidth'),
                height: Marionette.getOption(this, 'thumbnailHeight'),
                removable: true,
            };
        },
        childEvents: {
            'remove': 'onPictureRemoved'
        },
        getChildView: Thumbnail.create,
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
            this.filesInput = $(document.createElement('input')).attr({
                accept: '.gif,.jpeg,.jpg,.png',
                multiple: '',
                type: 'file',
            });
            this.filesInput.on('change', (function(e) {
                this.addFiles(e.target.files);
            }).bind(this));
            this.listenTo(this.collection, 'remove', function(model, col, opt) {
                this.trigger('remove-picture', model.attributes, opt.index);
            });
        },
        addFile: function(file) {
            if (file instanceof File) {
                var picture = {file: file};
                var index = this.collection.length;
                this.collection.add(picture);
                this.trigger('add-picture', picture, index);
            }
        },
        addFiles: function(files) {
            _.each(files, this.addFile, this);
        },
        onBeforeRender: function() {
            if (! this.addPictureButton) {
                this.addPictureButton = new AddItemButton(
                    _.extend(
                        {title: 'Ajouter une image'},
                        this.childViewOptions()
                    )
                );
                this.$el.append(this.addPictureButton.render().el);
                this.listenTo(this.addPictureButton, 'click', function() {
                    this.filesInput.click();
                });
            }
        },
        onDragEnter: function(e) {
            console.log('-- AchievementPictureList:onDragEnter');
            e.preventDefault();
            e.stopPropagation();
            this.$el.attr('data-state', 'over');
            return false;
        },
        onDragLeave: function(e) {
            console.log('-- AchievementPictureList:onDragLeave');
            e.preventDefault();
            e.stopPropagation();
            this.$el.removeAttr('data-state');
            return false;
        },
        onDragOver: function(e) {
            console.log('-- AchievementPictureList:onDragOver');
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        onDrop: function(e) {
            console.log('-- AchievementPictureList:onDrop');
            this.onDragLeave.call(this, e);
            this.addFiles(e.dataTransfer.files);
            return false;
        },
        onPictureRemoved: function(view, model) {
            view.remove();
            model.destroy();
        }
    });

    var AchievementEditor = Marionette.ItemView.extend({
        className: 'achievement-editor',
        ui: {
            descField: '#desc',
            nameField: '#name',
            tagsField: '#tags',
            publish:   '#publish'
        },
        events: {
            'blur   @ui.descField': 'onDescriptionChanged',
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.tagsField': 'onTagsChanged',
            'click  @ui.publish': 'onPublishClick'
        },
        template: _.template(editorTemplate),
        onDescriptionChanged: function() {
            console.log('-- AchievementEditor:onDescriptionChanged');
            this.model.set('description', this.ui.descField.val());
            return false;
        },
        onNameChanged: function() {
            console.log('-- AchievementEditor:onNameChanged');
            this.model.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onTagsChanged: function() {
            console.log('-- AchievementEditor:onTagsChanged');
            this.model.setTags(this.ui.tagsField.val().split(','));
            this.ui.tagsField.val(this.model.tags().join(', '));
            return false;
        },
        onPublishClick: function(e) {
            console.log('-- AchievementEditor:onPublishClick');

            e.preventDefault();
            e.stopPropagation();

            this.ui.publish.removeClass();

            if (this.model.togglePublish().published()) {
                this.ui.publish.addClass('unpublish-button');
            } else {
                this.ui.publish.addClass('publish-button');
            }

            return false;
        },
        onRender: function() {
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
            this.ui.tagsField.val(this.model.tags().join(', '));
            this.ui.publish.addClass(
                this.model.published() ? 'unpublish-button':'publish-button'
            );
            this.achievementPictureList = new AchievementPictureList({
                el: this.$('#pictures'),
                collection: new Backbone.Collection(
                    this.model.get('pictures'), {model: Thumbnail.model}
                )
            });
            this.listenTo(
                this.achievementPictureList,
                'add-picture',
                function(picture, index) {
                    console.log('add-picture: ', picture, index);
                    this.model.addPicture(picture);
                }
            );
            this.listenTo(
                this.achievementPictureList,
                'remove-picture',
                function(picture, index) {
                    console.log('remove-picture: ', picture, index);
                    this.model.removePicture(index);
                }
            );
            this.achievementPictureList.render();
        }
    });

    var AchievementEditorDialog = Dialog.extend({
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter' : 'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        accept: function() {
            console.log('-- AchievementEditorDialog:onAcceptClicked');

            var commit = (function() {
                this.model.set(this.getContent().currentView.model.toJSON());
                this.model.save();
                this.close();
            }).bind(this);

            if (! this.model.isNew()) {
                var editor = this;
                Dialog.createMessageBox(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Annuler',
                    }
                ).run();
            } else commit();
        },
        refuse: function() {
            console.log('-- AchievementEditorDialog:onCancelClicked');

            var commit = (function() {
                if (this.model.isNew()) {
                    this.model.destroy();
                }
                this.close();
            }).bind(this);

            if (this.getContent().currentView.model.hasChanged()) {
                var editor = this;
                Dialog.createMessageBox(
                    'Les modifications apportées seront perdues! Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Oui',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Non'
                    }
                ).run();
            } else commit();

            return false;
        },
        setContent: function(region) {
            region.show(new AchievementEditor({
                model: this.model.clone()
            }));
        }
    });

    AchievementEditorDialog.exec = function(achievement) {
        (new AchievementEditorDialog({model: achievement})).run();
    };

    return AchievementEditorDialog;
});
