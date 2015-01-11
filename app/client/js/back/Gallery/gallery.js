// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan  2 23:23:59 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
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


    var AchievementPictureList = Marionette.CollectionView.extend({
        childView: Thumbnail.view,
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
            this.configure({
                thumbnail: {
                    width:  128,
                    height: 128,
                    margin: 2
                }
            });
        },
        configure: function(config) {
            this.options = _.extend(
                this.options || {},
                _.pick(config || {}, 'thumbnail')
            );
            return this;
        },
        addChild: function(child, ChildView, index) {
            var thumbnail = new ChildView({
                tagName: 'li',
                model: child
            }).configure(_.extend(this.options.thumbnail, {editable: true}));
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
            this.$el.empty();
        }
    });


    var AchievementEditor = Marionette.ItemView.extend({
        ui: {
            nameField: '#name',
            descField: '#desc',
            addButton: '#add-pictures > input',
            submitButton: '#submit',
            cancelButton: '#cancel'
        },
        events: {
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.descField': 'onDescriptionChanged',
            'click  @ui.submitButton': 'onSubmitClicked',
            'click  @ui.cancelButton': 'onCancelClicked',
            'change @ui.addButton': 'onAddPictures'
        },
        template: _.template(achievementEditorTemplate),
        initialize: function() {
            this.workingCopy = this.model.clone();
            this.listenTo(this.workingCopy, 'change', function() {
                this.ui.submitButton.removeClass('disabled');
            });
        },
        onAddPictures: function(e) {
            console.log('-- AchievementEditor:onAddPictures');
            e.preventDefault();
            e.stopPropagation();
            this.achievementPictureList.addFiles(e.target.files);
            return false;
        },
        onSubmitClicked: function(e) {
            console.log('-- AchievementEditor:onSubmitClicked');
            e.preventDefault();
            e.stopPropagation();
            if (this.model.isNew() || this.workingCopy.hasChanged()) {
                this.model.set(this.workingCopy.toJSON());
                console.log(this.model.toJSON());
                // FIXME: connect to server
                // this.model.save();
            }
            this.trigger('closed');
            return false;
        },
        onCancelClicked: function(e) {
            console.log('-- AchievementEditor:onCancelClicked');
            e.preventDefault();
            e.stopPropagation();
            if (this.model.isNew()) {
                this.model.destroy();
            }
            this.trigger('closed');
            return false;
        },
        onNameChanged: function() {
            console.log('-- AchievementEditor:onNameChanged');
            this.workingCopy.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onDescriptionChanged: function() {
            console.log('-- AchievementEditor:onDescriptionChanged');
            this.workingCopy.set('description', this.ui.descField.val());
            return false;
        },
        onRender: function() {
            this.ui.submitButton.html(this.model.isNew() ? 'Ajouter':'Modifier');
            this.ui.nameField.val(this.workingCopy.get('name'));
            this.ui.descField.val(this.workingCopy.get('description'));
            this.achievementPictureList = new AchievementPictureList({
                el: this.$('#pictures'),
                collection: new Backbone.Collection(
                    this.workingCopy.get('pictures'), {model: Thumbnail.model}
                )
            });
            this.listenTo(
                this.achievementPictureList,
                'add-picture',
                function(picture, index) {
                    console.log('add-picture: ', picture, index);
                    this.workingCopy.addPicture(picture);
                }
            );
            this.listenTo(
                this.achievementPictureList,
                'remove-picture',
                function(picture, index) {
                    console.log('remove-picture: ', picture, index);
                    this.workingCopy.removePictureAtIndex(index);
                }
            );
            this.achievementPictureList.render();
        }
    });


    var AchievementList = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'thumbnails',
        ui: {
            addButton: '#add-achievement'
        },
        events: {
            'click @ui.addButton': 'onAddButtonClicked'
        },
        childView: Thumbnail.view,
        addAchievementTemplate: _.template(achievementListAddTemplate),
        initialize: function() {
            this.configuration = configuration.get('gallery');
        },
        configure: function(config) {
            this.options = _.extend(this.options || {}, config);
            return this;
        },
        onAddButtonClicked: function(e) {
            console.log('-- AchievementList:onAddButtonClicked');
            this.collection.add(new Achievement);
            e.preventDefault();
            e.stopPropagation();
        },
        onBeforeRender: function() {
            var thumb_config = this.configuration.get('thumbnail').toJSON();
            var w = thumb_config.width;
            var h = thumb_config.height;
            var font_size = Math.max(8, Math.min(w, h) - 32);
            var left_shift = (w - font_size)/2;
            var top_shift = (h - font_size)/2;

            this.addElement = $(document.createElement('li'))
                .addClass('thumb')
                .attr('data-last', '')
                .css({margin: thumb_config.margin})
                .html(this.addAchievementTemplate({
                    width: w,
                    height: h,
                }));
            this.addElement.find('a').css({
                left: left_shift,
                top: top_shift
            });
            this.addElement.find('i').css({
                fontSize: font_size,
                width: font_size,
                height: font_size,
            });
            this.$el.append(this.addElement);
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
            this.collection = new Backbone.Collection(
                [],
                {
                    model: Achievement,
                    // url: '/api/achievements'
                }
            );
            this.achievementList = new AchievementList({
                collection: this.collection
            });

            this.listenTo(this.achievementList, 'edit', this.openEditor);
            this.listenTo(this.collection, 'add', this.openEditor);
        },
        openEditor: function(achievement) {
            var region = this.getRegion('achievementEditor');
            var creator = new AchievementEditor({model: achievement});

            region.show(creator);
            region.$el.foundation('reveal', 'open', {
                close_on_background_click: false,
                close_on_esc: false,
            });
            region.$el.on('closed', function() {
                creator.remove();
            });
            this.listenTo(creator, 'closed', function() {
                region.$el.foundation('reveal', 'close');
            });
        },
        onRender: function() {
            this.getRegion('achievementList').show(this.achievementList);
        }
    });

    return Gallery;
});
