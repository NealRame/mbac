// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');
    var pictureThumbnailTemplate = require('text!common/Thumbnail/picture-thumbnail.html');

    return ThumbnailView.extend({
        template: _.template(pictureThumbnailTemplate),
        initialize: function() {
            ThumbnailView.prototype.initialize.apply(this);
            this.ui.thumbImage = 'img';
        },
        onRender: function() {
            var geometry = _.bind(this.geometry, this);
            var thumb_img = this.ui.thumbImage;
            var uris = this.pictureURIs();

            thumb_img
                .load(function() {
                    thumb_img.css(geometry(thumb_img.get(0)));
                })
                .attr('src', uris.thumbnail);
            this.ui.thumbLink.attr('href', uris.original);
        },
        pictureURIs: function() {
            var prefix = this.model.get('prefix');
            return _.chain(this.model.toJSON())
                .pick('original', 'thumbnail')
                .map(function(value, key) {
                    return [key, prefix + '/' + value];
                })
                .object()
                .value();
        }
    });
});
