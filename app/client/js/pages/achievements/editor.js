// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 18 21:40:04 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var Achievement = require('pages/achievements/achievement');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');

    var editorTemplate = require('text!pages/achievements/editor.html');

    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }

    var AchievementPictureList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        childViewOptions: {
            tagName: 'li',
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
        childView: Thumbnail,
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
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
            // view.remove();
            this.collection.remove(model);
        }
    });

    var AchievementEditor = Marionette.LayoutView.extend({
        className: 'achievement-editor',
        regions: {
            pictures: '#pictures',
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
            this.filesInput = $(document.createElement('input')).attr({
                accept: '.gif,.jpeg,.jpg,.png',
                multiple: '',
                type: 'file',
            });
            this.filesInput.on('change', (function(e) {
                this.achievementPictureList.addFiles(e.target.files);
            }).bind(this));
        },
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
        onAddPicturesClick: function(e) {
            console.log('-- AchievementEditor:onAddPicturesClick');
            e.preventDefault();
            e.stopPropagation();
            this.filesInput.click();
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
        onShow: function() {
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
            this.ui.tagsField.val(this.model.tags().join(', '));
            this.ui.publish.addClass(
                this.model.published() ? 'unpublish-button':'publish-button'
            );
            this.getRegion('pictures').show(this.achievementPictureList);
        },
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
                Dialog.prompt(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Annuler',
                    }
                );
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
