// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan  2 23:23:59 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Dialog = require('Dialog');
    var Thumbnail = require('back/Gallery/gallery.thumbnail');

    var galleryTemplate = require('text!back/Gallery/gallery.template.html');
    var achievementEditorTemplate = require('text!back/Gallery/gallery.achievement-create.template.html');
    var achievementListAddTemplate = require('text!back/Gallery/gallery.achievement-list-add.template.html');
    var configuration = require('Configuration');


    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }


    var Achievement = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            pictures: [],
            tags: [],
        },
        publish: function() {
            this.save({published: true});
        },
        unpublish: function() {
            this.save({published: false});
        },
        addPicture: function(picture) {
            var list = this.get('pictures').slice(0);
            if (! _.contains(list, picture)) {
                var index = list.length;
                list.push(picture);
                this.set({pictures: list});
                this.trigger('new-picture', picture, index);
                return list[index];
            }
        },
        removePictureAtIndex: function(index) {
            var list = this.get('pictures').slice(0);
            if (index < list.length) {
                var picture = (list.splice(index, 1))[0];
                this.set({pictures: list});
                return true;
            }
            return false;
        },
        validate: function(attributes, options) {
            var isValidPicture = function(picture) {
                return picture.file instanceof File
                || (picture.original && picture.thumbnail);
            };

            if (! attributes.name instanceof String) {
                return new Error('name must be a String');
            }
            if (! attributes.description instanceof String) {
                return new Error('description mus be a String');
            }
            if (! (attributes.pictures instanceof Array
                    && _.every(attributes.pictures, isValidPicture))) {
                return new Error('pictures must be a non empty Array of valid pictures');
            }
            if (! (attributes.tags instanceof Array
                    && _.every(attributes.tags, _.isString))) {
                return new Error('tags must be an Array of String');
            }
        },
        sync: function(method, model, options) {
            switch (method.toLowerCase()) {
            case 'create':
            case 'update':
            case 'patch':
                return (function() {
                    var data = model.attributes;
                    var form_data = new FormData;

                    _.chain(data)
                        .pick('name', 'description', 'published')
                        .each(function(value, attr) {
                            form_data.append(
                                attr,
                                attr === 'tags'
                                    ? escape(JSON.stringify(value))
                                    : value
                            )
                        });
                    _.each(data.pictures, function(picture) {
                        form_data.append(
                            'pictures',
                            picture.file instanceof File
                                ? picture.file
                                : JSON.stringify(picture)
                        );
                    });

                    var params = _.extend(
                        {
                            data: form_data,
                            contentType: false,
                            processData: false,
                            type: method === 'create' ? 'POST':'PUT',
                            url: options.url || model.url(),
                        },
                        options
                    );

                    var xhr = Backbone.ajax(params);

                    model.trigger('request', model, xhr, options);

                    return xhr;
                })();
                break;

            default:
                return Backbone.sync.call(this, method, model, options);
            }
        }
    });


    var AddItemButton = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'thumb',
        attributes: {
            'class': 'thumb',
            'data-last': ''
        },
        ui: {
            addButton: '#add-achievement'
        },
        triggers: {
            'click @ui.addButton': 'click'
        },
        initialize: function() {
            this.model = configuration.get('gallery.thumbnail');
            this.template = function(data) {
                if (_.isString(achievementListAddTemplate)) {
                    achievementListAddTemplate =
                    _.template(achievementListAddTemplate);
                }

                var w = data.width, h = data.height;
                var font_size = Math.max(8, Math.min(w, h) - 32);

                return achievementListAddTemplate({
                    width: w,
                    height: h,
                    margin: data.margin,
                    fontSize: font_size,
                    left: (w - font_size)/2,
                    top: (h - font_size)/2
                });
            }
        },
    });


    var AchievementPictureList = Marionette.CollectionView.extend({
        childView: Thumbnail.view,
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
            this.configuration = configuration.get('gallery.thumbnail');
            this.listenTo(this.collection, 'remove', function(model, col, opt) {
                this.trigger('remove-picture', model.attributes, opt.index);
            });
            this.filesInput = $(document.createElement('input')).attr({
                type: 'file', multiple: ''
            });
            this.filesInput.on('change', (function(e) {
                this.addFiles(e.target.files);
            }).bind(this));
        },
        addChild: function(child, ChildView, index) {
            var thumbnail = new ChildView({
                tagName: 'li',
                model: child
            }).configure(_.extend(this.configuration.toJSON(), {editable: true}));
            this.$el.append(thumbnail.render().el);
            this.listenTo(thumbnail, 'remove', function() {
                console.log('-- AchievementPictureList: remove');
                this.stopListening(thumbnail);
                child.destroy();
                thumbnail.remove();
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
        onBeforeRender: function() {
            if (! this.addPictureButton) {
                this.addPictureButton = new AddItemButton;
                this.$el.append(this.addPictureButton.render().el);
                this.listenTo(this.addPictureButton, 'click', function() {
                    console.log('pouet');
                    this.filesInput.click();
                });
            }
        }
    });


    var AchievementEditor = Marionette.ItemView.extend({
        ui: {
            nameField: '#name',
            descField: '#desc',
        },
        events: {
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.descField': 'onDescriptionChanged',
        },
        template: _.template(achievementEditorTemplate),
        onNameChanged: function() {
            console.log('-- AchievementEditor:onNameChanged');
            this.model.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onDescriptionChanged: function() {
            console.log('-- AchievementEditor:onDescriptionChanged');
            this.model.set('description', this.ui.descField.val());
            return false;
        },
        onRender: function() {
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
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
                    this.model.removePictureAtIndex(index);
                }
            );
            this.achievementPictureList.render();
        }
    });


    var AchievementEditorDialog = Dialog.extend({
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter':'Modifier';
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
                var editor_dialog  = this;
                var confirm_dialog = Dialog.createMessageBox(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor_dialog.open.bind(editor_dialog),
                        refuseLabel: 'Annuler',
                    }
                );
                this.$el.append(confirm_dialog.el);
                confirm_dialog.open();
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
                var editor_dialog  = this;
                var confirm_dialog = Dialog.createMessageBox(
                    'Les modifications apportées seront perdues! Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Oui',
                        refuse: editor_dialog.open.bind(editor_dialog),
                        refuseLabel: 'Non'
                    }
                );
                this.$el.append(confirm_dialog.el);
                confirm_dialog.open();
            } else commit();

            return false;
        },
        setContent: function(region) {
            region.show(new AchievementEditor({
                model: this.model.clone()
            }));
        }
    });


    var AchievementList = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'thumbnails',
        childView: Thumbnail.view,
        addAchievementTemplate: _.template(achievementListAddTemplate),
        initialize: function() {
            this.configuration = configuration.get('gallery');
        },
        onAddButtonClicked: function(e) {
            console.log('-- AchievementList:onAddButtonClicked');
            this.collection.add(new Achievement);
        },
        onBeforeRender: function() {
            if (! this.addAchievementButton) {
                this.addAchievementButton = new AddItemButton;
                this.$el.append(this.addAchievementButton.render().el);
                this.listenTo(this.addAchievementButton, 'click', this.onAddButtonClicked);
            }
        },
        addChild: function(child, ChildView, index) {
            var picture = function() {
                var pictures = child.get('pictures');
                return pictures.length > 0
                        ? new Thumbnail.model(pictures[0])
                        : null;
            };
            var thumbnail = new ChildView({
                tagName: 'li',
                model: picture()
            }).configure(this.configuration.get('thumbnail').toJSON());

            this.listenTo(child, 'change', function() {
                console.log('-- AchievementView: change');
                thumbnail.setPicture(picture());
            });
            this.listenTo(child, 'destroy', function() {
                console.log('-- AchievementView: remove');
                this.stopListening(thumbnail);
                thumbnail.remove();
            });
            this.listenTo(thumbnail, 'remove', function() {
                console.log('-- AchievementView: remove');
                this.stopListening(thumbnail);
                child.destroy();
                thumbnail.remove();
            });
            this.listenTo(thumbnail, 'edit', function() {
                console.log('-- AchievementView: edit');
                this.trigger('edit', child);
            });
            thumbnail.render().$el.insertBefore(this.$("[data-last]"));
        },
    });


    var Gallery = Marionette.LayoutView.extend({
        template: _.template(galleryTemplate),
        regions: {
            achievementEditor: '#achievement-editor',
            achievementList: '#achievement-list'
        },
        initialize: function() {
            console.log('-- Gallery:initialize');
            this.collection = new (Backbone.Collection.extend({
                model: Achievement,
                url: '/api/achievements'
            }));
            this.achievementList = new AchievementList({
                collection: this.collection
            });

            this.listenTo(this.achievementList, 'edit', this.openEditor);
            this.listenTo(this.collection, 'add', this.openEditor);

            this.collection.fetch({reset: true});
        },
        openEditor: function(achievement) {
            var region = this.getRegion('achievementEditor');
            var editor = new AchievementEditorDialog({model: achievement});

            region.show(editor);
            editor.open();
        },
        onRender: function() {
            console.log('-- Gallery:onRender');
            this.getRegion('achievementList').show(this.achievementList);
        }
    });

    return Gallery;
});
