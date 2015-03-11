// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');

    return ThumbnailView.extend({
        onRender: function() {
            var geometry = _.bind(this.geometry, this);
            var image = new Image();

            $(image)
                .load((function() {
                    $(image).css(geometry(image));
                    this.ui.thumbLink.empty().append(image);
                }).bind(this))
                .attr('src', this.model.thumbnailURL());
            this.ui.thumbLink.attr('href', this.model.originalURL());
        }
    });
});
