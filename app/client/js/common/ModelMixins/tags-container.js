/// Tags container mixin.
/// =====================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 19:12:28 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');

    return {
        defaults: {
            tags: []
        },
        tags: function() {
            return this.get('tags');
        },
        hasTags: function(tags) {
            if (_.isString(tags)) {
                return this.hasTags(
                    tags.split(',')
                        .map(function(tag){ return tag.trim().toLowerCase(); })
                );
            } else if (_.isArray(tags)) {
                return _.intersection(tags, this.tags()).length > 0;
            }
            throw new TypeError('Required a String or an array of Strings');
        },
        addTag: function(tag) {
            var tags = this.get('tags').slice(0);
            tags.push(tag);
            return this.setTags(tags);
        },
        setTags: function(tags) {
            tags =
                _.chain(tags || [])
                    .compact()
                    .map(function(tag) { return tag.trim().toLowerCase(); })
                    .uniq()
                    .value();
            return this.set('tags', tags);
        }
    };
});
