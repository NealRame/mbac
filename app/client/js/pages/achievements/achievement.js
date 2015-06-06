/*global File: false*/
/*eslint-disable no-underscore-dangle*/
// common/Achievement/achievement.js
// ---------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var functional = require('common/functional');
    var Picture = require('Picture');

    function isa(Model) {
        var keys = _.rest(arguments);
        return function(data) {
            if (!_.isUndefined(data)
                    && functional.hasAllOfKeys.apply(null, functional.construct(data, keys))) {
                return new Model(data);
            }
        };
    }

    var create_model = functional.dispatch(
        isa(Picture, 'original', 'thumbnail'),
        function(data) {
            if (!_.isUndefined(data)) {
                return new Backbone.Model(data);
            }
        }
    );

    function create_form_data(achievement) {
        var data = achievement.attributes;
        var form_data = new FormData();
        _.each(_.pick(data, 'name', 'description', 'published'), function(value, attr) {
            form_data.append(attr, value);
        });
        _.each(data.tags, function(tag) {
            form_data.append('tags', tag);
        });
        _.each(data.pictures, function(picture) {
            if (picture.file instanceof File) {
                form_data.append('files', picture.file);
            } else {
                form_data.append('pictures', picture._id);
            }
        });
        return form_data;
    }

    return Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            pictures: [],
            tags: []
        },
        published: function() {
            return this.get('published');
        },
        publish: function() {
            return this.set({published: true});
        },
        unpublish: function() {
            return this.set({published: false});
        },
        togglePublish: function() {
            return this.set({published: !this.published()});
        },
        pageURL: function() {
            return '/achievements/' + this.attributes._id;
        },
        description: function() {
            return this.get('description') || '';
        },
        picture: function(index) {
            return create_model(this.get('pictures')[index || 0]);
        },
        pictures: function() {
            return _.map(this.get('pictures'), function(data) {
                return create_model(data);
            });
        },
        addPicture: function(picture) {
            var list = this.get('pictures').slice(0);
            if (!_.contains(list, picture)) {
                var index = list.length;
                list.push(picture);
                this.set({pictures: list});
                this.trigger('new-picture', picture, index);
                return list[index];
            }
        },
        removePicture: function(index) {
            var list = this.get('pictures').slice(0);
            if (index < list.length) {
                var picture = (list.splice(index, 1))[0];
                this.set({pictures: list});
                return true;
            }
            return false;
        },
        tags: function() {
            return this.get('tags');
        },
        hasTags: function(tags) {
            if (_.isString(tags)) {
                return this.hasTags(
                    tags.split(',')
                        .map(function(tag){ return tag.trim().toLowerCase(); })
                );
            } else if (_.isArray(tags)) {
                return _.intersection(tags, this.tags()).length > 0;
            }
            throw new TypeError('Required a String or an array of Strings');
        },
        addTag: function(tag) {
            var tags = this.get('tags').slice(0);
            tags.push(tag);
            return this.setTags(tags);
        },
        setTags: function(tags) {
            tags =
                _.chain(tags || [])
                    .compact()
                    .map(function(tag) { return tag.trim().toLowerCase(); })
                    .uniq()
                    .value();
            return this.set('tags', tags);
        },
        validate: function(attributes) {
            var isValidPicture = function(picture) {
                return picture.file instanceof File || (picture.original && picture.thumbnail);
            };

            if (!(attributes.name instanceof String)) {
                return new Error('name must be a String');
            }
            if (!(attributes.description instanceof String)) {
                return new Error('description mus be a String');
            }
            if (!(attributes.pictures instanceof Array
                    && _.every(attributes.pictures, isValidPicture))) {
                return new Error('pictures must be a non empty Array of valid pictures');
            }
            if (!(attributes.tags instanceof Array
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
                    var form_data = create_form_data(model);
                    var xhr = Backbone.ajax(_.extend({
                        data: form_data,
                        contentType: false,
                        processData: false,
                        type: method === 'create' ? 'POST' : 'PUT',
                        url: options.url || model.url()
                    }, options));
                    model.trigger('request', model, xhr, options);
                    return xhr;
                })();

            default:
                return Backbone.sync.call(this, method, model, options);
            }
        }
    });
});
