/// Reseller backbone model.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 21:27:17 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var ModelFlagMixin = require('ModelFlagMixin');
    var ModelFormDataSyncMixin = require('ModelFormDataSyncMixin');
    var ModelPicturesContainerMixin = require('ModelPicturesContainerMixin');
    var errors = require('common/errors');
    var functional = require('common/functional');

    function create_form_data(reseller) {
        var data = reseller.attributes;
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

    var ResellerProto = functional.merge(
        {
            idAttribute: '_id',
            defaults: {
                published: false,
                pictures: []
            },
            pageURL: function() {
                return '/products/resellers' + this.attributes._id;
            },
            description: function() {
                return this.get('description') || '';
            }
        },
        ModelFlagMixin('published', false),
        ModelFormDataSyncMixin(create_form_data),
        ModelPicturesContainerMixin
    );

    return Backbone.Model.extend(ResellerProto);
});
