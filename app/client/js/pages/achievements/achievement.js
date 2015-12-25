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
    var FormDataModelSynchronizer = require('FormDataModelSynchronizer');
    var PicturesContainer = require('PicturesContainer');
    var TagsContainer = require('TagsContainer');

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

    var AchievementProto =  _.assign({
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
        validate: function(attributes) {
            var isValidPicture = function(picture) {
                return picture.file instanceof File || (picture.original && picture.thumbnail);
            };

            if (!_.isString(attributes.name)) {
                return new Error('name must be a String');
            }
            if (!_.isString(attributes.description)) {
                return new Error('description mus be a String');
            }
            if (!(_.isArray(attributes.pictures)
                    && _.every(attributes.pictures, isValidPicture))) {
                return new Error('pictures must be a non empty Array of valid pictures');
            }
            if (!(_.isArray(attributes.tags)
                    && _.every(attributes.tags, _.isString))) {
                return new Error('tags must be an Array of String');
            }
        }
    }, PicturesContainer, TagsContainer, FormDataModelSynchronizer(create_form_data));

    return Backbone.Model.extend(AchievementProto)
});
