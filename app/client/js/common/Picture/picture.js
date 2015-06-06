// common/Picture/picture.js
// -------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Mar 11 02:55:31 CET 2015
define(function(require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: '_id',
        date: function() {
            return this.get('date');
        },
        prefix: function() {
            return '/' + this.get('prefix');
        },
        originalURL: function() {
            return this.prefix() + '/' + this.get('original');
        },
        thumbnailURL: function() {
            return this.prefix() + '/' + this.get('thumbnail');
        },
        height: function() {
            return this.get('height');
        },
        width: function() {
            return this.get('width');
        },
        size: function() {
            return {height: this.height(), width: this.width()};
        }
    });
});
