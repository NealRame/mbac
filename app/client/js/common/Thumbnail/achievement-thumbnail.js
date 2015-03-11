// Thumbnail/achievement-thumbnail.js
// ----------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 23:06:45 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');

    return ThumbnailView.extend({
        onRender: function() {
            var uris = this.pictureURIs();

            this.ui.thumbLink.attr('href', uris.original);
            if (uris.thumbnail) {
                var geometry = _.bind(this.geometry, this);
                var image = new Image;
                this.ui.thumbLink.empty().append(
                    $(image)
                        .load((function() {
                            $(image).css(geometry(image));
                            this.ui.thumbLink.empty().append(image);
                        }).bind(this))
                        .attr('src', uris.thumbnail)
                );
            } else {
                this.ui.thumbLink.empty().append(this.placeholder());
            }
        },
        pictureURIs: function() {
            var achievement = this.model.toJSON();
            var uris = {
                original: '/pages/realisations/' + achievement._id,
            };
            if (achievement.pictures.length > 0) {
                var picture = achievement.pictures[0];
                uris.thumbnail = picture.prefix + '/' + picture.thumbnail;
            }
            return uris;
        },
        placeholder: function() {
            var width = this.options.width;
            var height = this.options.height;
            var font_size = Math.min(width, height) - 32;
            return $(document.createElement('i'))
                .addClass(['fa', 'fa-ban', 'fa-fw', 'placeholder'].join(' '))
                .css({
                    fontSize: font_size,
                    height: font_size,
                    left: (width - font_size)/2,
                    top: (height - font_size)/2,
                    width: font_size,
                });
        }
    });
});
