// Product backbone model.
// =======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Dec 24 23:25:06 CET 2015
define(function(require) {
    'use strict';

    // var _ = require('underscore');
    var Backbone = require('backbone');

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
            return this.get('pictures')[index || 0];
        },
        pictures: function() {
            this.get('pictures');
        }
    });

});
