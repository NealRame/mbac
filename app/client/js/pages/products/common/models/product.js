// Product backbone model.
// =======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Dec 24 23:25:06 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var FlagModelMixin = require('FlagModelMixin');
    var FormDataModelSynchronizer = require('FormDataModelSynchronizer');
    var PicturesContainer = require('PicturesContainer');
    var TagsContainer = require('TagsContainer');
    var errors = require('common/errors');
    var functional = require('common/functional');

    function create_form_data(product) {
        var data = product.attributes;
        var form_data = new FormData();
        _.each(_.pick(data, 'available', 'date', 'name', 'description', 'price', 'published'), function(value, attr) {
            form_data.append(attr, value);
        });
        _.each(data.tags, function(tag) {
            form_data.append('tags', tag);
        });
        _.each(data.resellers, function(reseller) {
            form_data.append('resellers', reseller._id);
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

    var ProductProto = functional.merge(
        {
            idAttribute: '_id',
            defaults: function() {
                return {
                    available: false,
                    date: new Date(),
                    pictures: [],
                    price: 0,
                    published: false,
                    resellers: [],
                    tags: []
                };
            },
            date: function() {
                return new Date(this.attributes.date);
            },
            pageURL: function() {
                return '/products/' + this.attributes._id;
            },
            editURL: function() {
                return '#' + this.attributes._id;
            },
            name: function() {
                return this.get('name') || '';
            },
            setName: function(name) {
                return this.set('name', name);
            },
            description: function() {
                return this.get('description') || '';
            },
            setDescription: function(description) {
                return this.set('description', description);
            },
            price: function() {
                return this.get('price');
            },
            setPrice: function(price) {
                return this.set('price', price);
            },
            validate: function(attributes) {
                var error;
                var is_valid_picture = function(picture) {
                    return picture.file instanceof File || (picture.original && picture.thumbnail);
                };
                var is_valid_tag = function(tag) {
                    return _.isString(tag) && tag.trim() != '';
                };

                if (!_.isString(attributes.name) || attributes.name.trim() === '') {
                    error = _.assign(error || {}, {
                        name: 'name must be a String'
                    });
                }
                if (!_.isString(attributes.description)) {
                    error = _.assign(error || {}, {
                        description: 'description must be a String'
                    });
                }
                if (!_.isNumber(attributes.price)) {
                    error = _.assign(error || {}, {
                        price: 'price must be a Number'
                    })
                }
                if (!(_.isArray(attributes.pictures)
                        && _.every(attributes.pictures, is_valid_picture))) {
                    error = _.assign(error || {}, {
                        pictures: 'pictures must be a non empty Array of valid pictures'
                    });
                }
                if (!(_.isArray(attributes.tags)
                        && _.every(attributes.tags, is_valid_tag))) {
                    error = _.assign(error || {}, {
                        tags: 'tags must be an Array of String'
                    });
                }
                if (functional.existy(error)) {
                    return new errors.ModelValidationError(error);
                }
            }
        },
        PicturesContainer,
        FlagModelMixin('available', false),
        FlagModelMixin('published', false),
        TagsContainer,
        FormDataModelSynchronizer(create_form_data)
    );

    return Backbone.Model.extend(ProductProto);
});
