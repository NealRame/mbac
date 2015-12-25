/// Published state mixin.
/// ======================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 19:12:28 CET 2015
define(function() {
    'use strict';

    return {
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
        }
    };
});
