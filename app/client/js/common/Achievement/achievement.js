// common/Achievement/achievement.js
// ---------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            pictures: [],
            tags: [],
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
            return this.set({published: ! this.published()});
        },
        pageURL: function() {
            return '/pages/achievements/' + this.attributes._id;
        },
        picture: function(index) {
            return this.get('pictures')[index || 0];
        },
        pictures: function() {
            return this.get('pictures');
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
                        .map(function(tag){return tag.trim().toLowerCase();})
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
            var tags =
                _.chain(tags || [])
                    .compact()
                    .map(function(tag) {return tag.trim().toLowerCase();})
                    .uniq()
                    .value();
            return this.set('tags', tags);
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
                            form_data.append(attr, value);
                        });
                    _.each(data.tags, function(tag) {
                        form_data.append('tags', tag);
                    });
                    _.each(data.pictures, function(picture) {
                        form_data.append(
                            'pictures',
                            picture.file instanceof File
                                ? picture.file : picture._id
                        );
                    });

                    var params = _.extend(
                        {
                            data: form_data,
                            contentType: false,
                            processData: false,
                            type: method === 'create' ? 'POST' : 'PUT',
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
});
