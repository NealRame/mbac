/// Reseller backbone model.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 21:27:17 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var FormDataModelSynchronizer = require('FormDataModelSynchronizer');
    var PicturesContainer = require('PicturesContainer');
    var PublishState = require('PublishState');

    function create_form_data(product) {
        var data = product.attributes;
        var form_data = new FormData();
        _.each(_.pick(data, 'address', 'description', 'mail', 'name', 'phone', 'published', 'www'), function(value, attr) {
            form_data.append(attr, value);
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
    }, PicturesContainer, PublishState, FormDataModelSynchronizer(create_form_data));

    return Backbone.Model.extend(ProductProto);
});
