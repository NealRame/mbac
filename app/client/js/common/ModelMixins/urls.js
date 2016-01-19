/// URLs mixin.
/// ===========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Jan 19 23:22:17 CET 2016
define(function() {
    'use strict';
    return function(prefix) {
        return {
            pageURL: function() {
                return prefix + '/' + this.attributes._id;
            },
            editURL: function() {
                return '#' + this.attributes._id;
            },
            previewURL: function() {
                return this.editURL() + '/preview';
            }
        };
    }
});
