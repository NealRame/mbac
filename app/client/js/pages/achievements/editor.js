/*global File: false*/
// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 18 21:40:04 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');
    var ThumbnailList = require('ThumbnailList');
    var editorTemplate = require('text!pages/achievements/editor.html');

    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }

    var AchievementPictureList = ThumbnailList.extend({
        thumbnailOptions: {
            removable: true,
            clickBehavior: 'none',
            rect: {
                height: 128,
                width: 192
            }
        },
        childEvents: {
            'remove': 'onPictureRemoved'
        },
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
            ThumbnailList.prototype.initialize.call(this);
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
        center: function() {
            this.$el.removeAttr('style');
            if (this.children.length > 0) {
                var th_width = this.children.first().outerRect().width;
                this.$el.css('width', th_width*Math.floor(this.$el.width()/th_width));
            }
        },
        onDragEnter: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.attr('data-state', 'over');
            return false;
        },
        onDragLeave: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.removeAttr('data-state');
            return false;
        },
        onDragOver: function(e) {
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        onDrop: function(e) {
            this.onDragLeave.call(this, e);
            this.addFiles(e.dataTransfer.files);
            return false;
        },
        onPictureRemoved: function(view, model) {
            // view.remove();
            this.collection.remove(model);
        }
    });

    var AchievementEditor = Marionette.LayoutView.extend({
        className: 'achievement-editor',
        regions: {
            pictures: '#pictures'
        },
        ui: {
            descField: '#desc',
            nameField: '#name',
            tagsField: '#tags',
            addPictures: '#add-pictures',
            publish:   '#publish'
        },
        events: {
            'blur   @ui.descField': 'onDescriptionChanged',
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.tagsField': 'onTagsChanged',
            'click  @ui.addPictures': 'onAddPicturesClick',
            'click  @ui.publish': 'onPublishClick'
        },
        template: _.template(editorTemplate),
        initialize: function() {
            this.achievementPictureList = new AchievementPictureList({
                collection: new Backbone.Collection(this.model.pictures())
            });
            this.listenTo(
                this.achievementPictureList,
                'add-picture',
                function(picture) {
                    this.model.addPicture(picture);
                }
            );
            this.listenTo(
                this.achievementPictureList,
                'remove-picture',
                function(picture, index) {
                    this.model.removePicture(index);
                }
            );
            this.filesInput = $(document.createElement('input')).attr({
                accept: '.gif,.jpeg,.jpg,.png',
                multiple: '',
                type: 'file'
            });
            this.filesInput.on('change', (function(e) {
                this.achievementPictureList.addFiles(e.target.files);
            }).bind(this));
        },
        onDescriptionChanged: function() {
            this.model.set('description', this.ui.descField.val());
            return false;
        },
        onNameChanged: function() {
            this.model.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onTagsChanged: function() {
            this.model.setTags(this.ui.tagsField.val().split(','));
            this.ui.tagsField.val(this.model.tags().join(', '));
            return false;
        },
        onAddPicturesClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.filesInput.click();
            return false;
        },
        onPublishClick: function(e) {
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
        onShow: function() {
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
            this.ui.tagsField.val(this.model.tags().join(', '));
            this.ui.publish.addClass(
                this.model.published() ? 'unpublish-button':'publish-button'
            );
            this.getRegion('pictures').show(this.achievementPictureList);
        }
    });

    var AchievementEditorDialog = Dialog.extend({
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter' : 'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        accept: function() {
            var commit = (function() {
                var attributes = this.getContent().currentView.model.toJSON();
                this.model.set(attributes);
                this.model.save();
                this.close();
            }).bind(this);

            if (!this.model.isNew()) {
                var editor = this;
                Dialog.prompt(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Annuler'
                    }
                );
            } else commit();
        },
        refuse: function() {
            var commit = (function() {
                if (this.model.isNew()) {
                    this.model.destroy();
                }
                this.close();
            }).bind(this);

            if (this.getContent().currentView.model.hasChanged()) {
                var editor = this;
                Dialog.prompt(
                    'Les modifications apportées seront perdues! Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Oui',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Non'
                    }
                );
            } else commit();

            return false;
        },
        setContent: function(region) {
            region.show(new AchievementEditor({
                model: this.model.clone()
            }));
        }
    });

    AchievementEditorDialog.open = function(achievement) {
        (new AchievementEditorDialog({model: achievement})).run();
    };

    return AchievementEditorDialog;
});
