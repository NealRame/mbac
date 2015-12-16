/// /client/js/pages/logs/model.js
/// ------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 12 21:37:02 CET 2015
define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var functional = require('common/functional');

    return Backbone.Model.extend({
        idAttribute: '_id',
        hasStack: function() {
            return functional.existy(
                functional.property(this.attributes, 'meta.stack')
            );
        },
        hasStatus: function() {
            return functional.existy(this.status());
        },
        hasRequestURL: function() {
            return functional.existy(this.requestURL());
        },
        stack: function() {
            if (this.hasStack()) {
                var stack = functional.property(this.attributes, 'meta.stack');
                return stack.split('\n').map(function(line) {
                    return line.trim();
                });
            }
        },
        status: function() {
            return functional.property(this.attributes, 'meta.status');
        },
        requestURL: function() {
            return functional.property(this.attributes, 'meta.url');
        }
    });
});
