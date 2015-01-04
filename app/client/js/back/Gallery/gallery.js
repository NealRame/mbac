// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan  2 23:23:59 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var galleryTemplate = require('text!back/Gallery/gallery.template.html');

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
                if (picture instanceof File) {
                    picture = {file: picture};
                }
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


    var Achievements = Backbone.Collection.extend({
        model: Achievement,
        // url: '/api/achievements'
    });


    var Picture = Backbone.Model.extend({
        setPicture: function(picture) {
            this.unset('original',  {silent: true});
            this.unset('thumbnail', {silent: true});
            this.unset('file',      {silent: true});
            this.set(picture);
        },
        validate: function(attributes) {
            if (! (attributes.file instanceof File)
                    || (attributes.thumbnail instanceof String
                        && attributes.original instanceof String)) {
                return new Error('invalid thumbnail data');
            }
        }
    });


    var Thumbnail = Marionette.ItemView.extend({
        className: 'thumb',
        ui: {
            'actions': '.action-bar > a'
        },
        events: {
            'click @ui.actions': 'onActionRequested',
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        getOption: Marionette.proxyGetOption,
        initialize: function(attr, options) {
            this.configure(
                _.extend(
                    options || {},
                    {
                        removable: true,
                        editable: true,
                        side: 128,
                    }
                )
            );
        },
        configure: function(options, render) {
            this.options = _.extend(
                this.options || {},
                _.pick(options || {}, 'removable', 'editable', 'side')
            );
            if (render) {
                this.render();
            }
            return this;
        },
        onActionRequested: function(e) {
            e.preventDefault();
            this.trigger($(e.currentTarget).attr('data-action'), this.model);
            return false;
        },
        onMouseEnter: function(e) {
            this.$('.action-bar').fadeIn(100);
            return false;
        },
        onMouseLeave: function(e) {
            this.$('.action-bar').fadeOut(100);
            return false;
        },
        template: false,
        onBeforeRender: function() {
            var side = this.options.side;

            var create_spinner = (function() {
                var fontSize = side/4;
                var shift = 3*fontSize/2;

                return $(document.createElement('i'))
                    .addClass('fa fa-circle-o-notch fa-spin')
                    .css({
                        position: 'absolute',
                        fontSize: fontSize,
                        height: fontSize,
                        width: fontSize,
                        left: shift,
                        top:  shift
                    });
            }).bind(this);

            var create_placeholder = (function() {
                var fontSize = side - 32;
                var shift = (side - fontSize)/2;

                return $(document.createElement('i'))
                    .addClass('fa fa-ban fa-fw')
                    .css({
                        color: 'lightgray',
                        position: 'absolute',
                        fontSize: fontSize,
                        height: fontSize,
                        width: fontSize,
                        left: shift,
                        top:  shift
                    });
            }).bind(this);

            var create_action_bar = (function() {
                var actions = [];
                if (this.options.removable) {
                    actions.push(
                        $(document.createElement('a'))
                            .attr('href', '#')
                            .attr('data-action', 'remove')
                            .append($(document.createElement('i')).addClass('fa fa-trash'))
                    );
                }
                if (this.options.editable) {
                    actions.push(
                        $(document.createElement('a'))
                            .attr('href', '#')
                            .attr('data-action', 'edit')
                            .append($(document.createElement('i')).addClass('fa fa-pencil'))
                    );
                }
                return $(document.createElement('div')).addClass('action-bar').append(actions);
            }).bind(this);

            var create_thumb = (function(cb) {
                if (! this.model) {
                    var elt = create_placeholder();
                    if (cb) {
                        cb.call(this, elt);
                    }
                    return elt;
                }

                this.$el.append(create_spinner());

                var data = this.model.toJSON();
                var view = this;
                var img = new Image;

                img.onload = function() {
                    var w = img.width, h = img.height, r = w/h;

                    if (r > 1) {
                        w = side*r;
                        $(img).css({
                            left: (side - w)/2,
                            width: w,
                            height: side
                        });
                    } else {
                        h = side/r;
                        $(img).css({
                            top: (side - h)/2,
                            width: side,
                            height: h
                        });
                    }

                    if (cb) {
                        cb.call(view, $(img));
                    }
                };

                if (data.file instanceof File) {
                    var reader = new FileReader;
                    reader.onload = (function(e) {
                        img.src = e.target.result;
                    });
                    reader.readAsDataURL(data.file);
                } else {
                    // img.src = 'files/' + data.thumbnail;
                    img.src = data.thumbnail;
                }

                return $(img);
            }).bind(this);

            this.$el.empty();
            this.$el.css({width: side, height: side});

            create_thumb(function(thumb) {
                this.$('i').remove();
                this.$el
                    .append(thumb)
                    .append(create_action_bar());
            });

            return this;
        }
    });


    var AchievementView = Marionette.ItemView.extend({
        tagName: 'li',
        template: false,
        initialize: function() {
            var pictures = this.model.get('pictures');
            this.thumbnail = new Thumbnail({
                model: pictures.length > 0 ? new Picture(pictures[0]) : null
            });
            this.listenTo(this.thumbnail, 'remove', function() {
                console.log('-- AchievementView: remove');
                this.model.destroy();
                this.thumbnail.remove();
            });
            this.listenTo(this.thumbnail, 'edit', function() {
                console.log('-- AchievementView: edit');
            });
        },
        onRender: function() {
            this.$el.append(this.thumbnail.render().el);
        }
    });


    var AchievementCreator = Marionette.ItemView.extend({
        ui: {
            nameField: '#name',
            descField: '#desc',
            addButton: '#add-picture > input',
            sbtButton: 'input[type=submit]'
        },
        events: {
            'blur @ui.nameField': 'onNameChanged',
            'blur @ui.descField': 'onDescriptionChanged',
            'change @ui.addButton': 'onAddPicture',
            'click @ui.sbtButton': 'onOkClicked'
        },
        initialize: function() {
            this.reset();
        },
        setModel: function(model) {
            if (this.model) {
                this.stopListening(this.model);
            }
            this.model = model || new Achievement;
            this.listenTo(this.model, 'destroy', this.reset);
            this.render();
        },
        onNameChanged: function() {

        },
        onDescriptionChanged: function() {

        },
        onAddPicture: function() {

        },
        onOkClicked: function() {

        },
        onRender: function() {
            if (this.achievementPictureList) {
                this.stopListening(this.achievementPictureList);
                this.achievementPictureList.stopListening();
                this.achievementPictureList.remove();
            }
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));

        }
    });


    var achievements = new Achievements();

    achievements.add(new Achievement({
        name: 'Kittens',
        description: 'Some cats, that\'s all',
        pictures: [
            {
                original: 'http://placekitten.com/g/800/600',
                thumbnail: 'http://placekitten.com/g/128/128',
            }
        ]
    }));

    var Gallery = Marionette.ItemView.extend({
        template: _.template(galleryTemplate),
        initialize: function() {
            this.configure({});
        },
        configure: function(config) {
            this.config = _.extend(this.config || {}, config);
            return this;
        },
        onBeforeRender: function() {
        },
        onRender: function() {
            this.achievementList = (new Marionette.CollectionView({
                collection: achievements,
                childView: AchievementView,
                el: this.$('#achievement-list')
            })).render();
        }
    });

    return Gallery;
});
