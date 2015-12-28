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
    var PictureList = require('PictureList');

    var editorTemplate = require('text!pages/achievements/editor.html');

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
            this.achievementPictureList = new PictureList({
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
        },
        data: function() {
            return this.model;
        }
    });

    var AchievementEditorDialog = Dialog.extend({
        childView: AchievementEditor,
        childViewOptions: function() {
            return {
                model: this.model.clone()
            };
        },
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter' : 'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        onAccept: function(model) {
            var commit = (function() {
                this.model.set(model.toJSON());
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
        onRefuse: function(model) {
            var commit = (function() {
                if (this.model.isNew()) {
                    this.model.destroy();
                }
                this.close();
            }).bind(this);

            if (model.hasChanged()) {
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
        }
    });

    AchievementEditorDialog.open = function(achievement) {
        (new AchievementEditorDialog({model: achievement})).run();
    };

    return AchievementEditorDialog;
});
