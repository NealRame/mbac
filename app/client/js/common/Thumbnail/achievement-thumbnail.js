// Thumbnail/achievement-thumbnail.js
// ----------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 23:06:45 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;
    var Promise = require('promise');

    var async = require('utils/async');
    var Picture = require('Picture');
    var GenericThumbnailView = require('common/Thumbnail/generic-thumbnail');

    return GenericThumbnailView.extend({
        renderThumbnail: function() {
            var picture = this.picture();
            if (!_.isUndefined(picture)) {
                return async.loadImage(picture.thumbnailURL())
                    .bind(this)
                    .then(function(image) {
                        $(image).css(this.geometry(image));
                        return {
                            el: image,
                            target: this.model.pageURL()
                        };
                    })
                    .catch(function() {
                        throw new Error('Failed to load image: ' + source);
                    });
            } else {
                return Promise.resolve({
                    el: null,
                    target: this.model.pageURL()
                });
            }
        },
        picture: function() {
            var picture = this.model.picture();
            return picture ? new Picture(picture) : undefined;
        },
    });
});
