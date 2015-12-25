// Product backbone model.
// =======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Dec 24 23:25:06 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var FormDataModelSynchronizer = require('FormDataModelSynchronizer');
    var PicturesContainer = require('PicturesContainer');
    var PublishState = require('PublishState');
    var TagsContainer = require('TagsContainer');

    function create_form_data(product) {
        var data = product.attributes;
        var form_data = new FormData();
        _.each(_.pick(data, 'date', 'name', 'description', 'price', 'published'), function(value, attr) {
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

    var ProductProto = _.assign({
        idAttribute: '_id',
        defaults: {
            published: false,
            pictures: [],
            resellers: [],
            tags: []
        },
        pageURL: function() {
            return '/products/' + this.attributes._id;
        },
        description: function() {
            return this.get('description') || '';
        }
    }, PicturesContainer, PublishState, TagsContainer, FormDataModelSynchronizer(create_form_data));

    return Backbone.Model.extend(ProductProto);
});
