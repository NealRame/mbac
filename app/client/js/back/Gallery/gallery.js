// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan  2 23:23:59 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Thumbnail = require('back/Gallery/gallery.thumbnail');

    var achievementCreateTemplate = require('text!back/Gallery/gallery.achievement-create.template.html');
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
            console.log('-- AchievementCreator:onDragEnter');
            e.preventDefault();
            e.stopPropagation();
            this.$el.attr('data-state', 'over');
            return false;
        },
        onDragLeave: function(e) {
            console.log('-- AchievementCreator:onDragLeave');
            e.preventDefault();
            e.stopPropagation();
            this.$el.removeAttr('data-state');
            return false;
        },
        onDragOver: function(e) {
            console.log('-- AchievementCreator:onDragOver');
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        onDrop: function(e) {
            console.log('-- AchievementCreator:onDrop');
            this.onDragLeave.call(this, e);
            this.addFiles(e.dataTransfer.files);
            return false;
        },
        onBeforeRender: function() {
            console.log('-- AchievementCreator:onBeforeRender', this.collection.toJSON());
            this.$el.empty();
        }
    });


    var AchievementCreator = Marionette.ItemView.extend({
        ui: {
            nameField: '#name',
            descField: '#desc',
            addButton: '#add-pictures > input',
            sbtButton: '#submit'
        },
        events: {
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.descField': 'onDescriptionChanged',
            'click  @ui.sbtButton': 'onOkClicked',
            'change @ui.addButton': 'onAddPictures'
        },
        template: false,
        initialize: function() {
            this.achievementPictureList = new AchievementPictureList({
                el: this.$('#pictures'),
                collection: new Backbone.Collection(
                    [], {model: Thumbnail.model}
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
            this.render();
            this.reset();
        },
        reset: function(render) {
            return this.setModel(null);
        },
        setModel: function(model) {
            if (this.model) {
                this.stopListening(this.model);
            }
            this.model = model || new Achievement;
            this.listenTo(this.model, 'destroy', this.reset);
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
            this.achievementPictureList.collection.reset(this.model.get('pictures'));
            return this;
        },
        onNameChanged: function() {
            console.log('-- AchievementCreator:onNameChanged');
            this.model.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onDescriptionChanged: function() {
            console.log('-- AchievementCreator:onDescriptionChanged');
            this.model.set('description', this.ui.descField.val());
            return false;
        },
        onAddPictures: function(e) {
            console.log('-- AchievementCreator:onAddPictures');
            e.preventDefault();
            e.stopPropagation();
            this.achievementPictureList.addFiles(e.target.files);
            return false;
        },
        onOkClicked: function(e) {
            console.log('-- AchievementCreator:onOkClicked');
            e.preventDefault();
            e.stopPropagation();
            if (this.model.isNew()) {
                this.collection.add(this.model);
            }
            return false;
        },
        onRender: function() {
            this.achievementPictureList.render();
            return this;
        }
    });


    var AchievementList = Marionette.CollectionView.extend({
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
            console.log(this.configuration.toJSON());
            this.render();
        },
        configure: function(config) {
            this.options = _.extend(this.options || {}, config);
            return this;
        },
        onAddButtonClicked: function(e) {
            console.log('-- AchievementList:onAddButtonClicked');
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


    var achievements = new Backbone.Collection(
        [
            new Achievement({
                name: 'Kittens',
                description: 'Some cats, that\'s all',
                pictures: [
                    {
                        original: 'http://placekitten.com/g/800/600',
                        thumbnail: 'http://placekitten.com/g/128/128',
                    }
                ]
            })
        ],
        {
            model: Achievement,
            // url: '/api/achievements'
        }
    );

    var Gallery = Marionette.ItemView.extend({
        template: _.template(achievementCreateTemplate),
        initialize: function() {
        },
        onBeforeRender: function() {
        },
        onRender: function() {
            this.achievementCreator = new AchievementCreator({
                el: this.$('#achievement-creator'),
                collection: achievements,
            });
            this.achievementList = new AchievementList({
                el: this.$('#achievement-list'),
                collection: achievements,
            });
            this.listenTo(this.achievementList, 'edit', function(model) {
                this.achievementCreator.setModel(model);
            });
        }
    });

    return Gallery;
});
