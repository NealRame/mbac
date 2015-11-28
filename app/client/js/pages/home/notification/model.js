/// /pages/home/notification.js
/// ---------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Nov 26 13:33:35 CET 2015
define(function(require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            start: Date.now(),
            description: ''
        },
        text: function() {
            return this.get('description');
        },
        published: function() {
            return this.get('published');
        },
        startDate: function() {
            return new Date(this.get('start'));
        },
        startTime: function() {
            return this.startDate().getTime();
        },
        endDate: function() {
            if (this.has('end')) {
                return new Date(this.get('end'));
            }
        },
        endTime: function() {
            var d = this.endDate();
            if (d != null) {
                return d.getTime();
            }
            return Number.MAX_VALUE;
        },
        active: function() {
            var now = Date.now();
            return now >= this.startTime() && now < this.endTime();
        }
    });
});
