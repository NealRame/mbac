/// /pages/home/notification.js
/// ---------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Nov 26 13:33:35 CET 2015
define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var functional = require('common/functional');

    function format(date) {
        var options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZone: 'UTC',
            hour12: false
        };
        return functional.existy(date) ? date.toLocaleString('fr-FR', options) : '-';
    }

    return Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            published: false,
            start: Date.now(),
            description: ''
        },
        message: function() {
            return this.get('description');
        },
        setMessage: function(msg) {
            this.set('description', msg);
            return this;
        },
        published: function() {
            return this.get('published');
        },
        setPublished: function(published) {
            this.set('published', published);
            return this;
        },
        startDate: function() {
            return new Date(this.get('start'));
        },
        startDateString: function() {
            return format(this.startDate());
        },
        setStartDate: function(date) {
            this.set('start', date.getTime());
            return this;
        },
        startTime: function() {
            return this.startDate().getTime();
        },
        endDate: function() {
            if (this.has('end')) {
                return new Date(this.get('end'));
            }
        },
        endDateString: function() {
            return format(this.endDate());
        },
        setEndDate: function(date) {
            this.set('end', date.getTime());
            return this;
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
