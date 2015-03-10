// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');

    return ThumbnailView.extend({
        initialize: function() {
            ThumbnailView.prototype.initialize.apply(this);
            this.ui.thumbImage = 'img';
        },
        onRender: function() {
            var geometry = _.bind(this.geometry, this);
            var image = new Image;
            var uris = this.pictureURIs();

            $(image)
                .load((function() {
                    $(image).css(geometry(image));
                    this.ui.thumbLink.empty().append(image);
                }).bind(this))
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
