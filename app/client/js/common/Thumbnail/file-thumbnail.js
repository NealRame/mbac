// Thumbnail/file-thumbnail.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:37 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');
    var fileThumbnailTemplate = require('text!common/Thumbnail/file-thumbnail.html');

    return ThumbnailView.extend({
        template: _.template(fileThumbnailTemplate),
        initialize: function() {
            ThumbnailView.prototype.initialize.apply(this);
            this.ui.thumbImage = 'canvas';
        },
        onRender: function() {
            var image = new Image;
            var reader = new FileReader;

            image.onload = (function() {
                var contex = this.ui.thumbImage.get(0).getContext('2d');
                var geo = this.geometry(image);

                this.ui.thumbImage
                    .attr(_.pick(geo, 'width', 'height'))
                    .css(_.pick(geo, 'left', 'top'));
                contex.drawImage(image, 0, 0, geo.width, geo.height);
            }).bind(this);

            // Read the file data as DataURL and set image source
            reader.onload = (function(e) {
                this.ui.thumbLink.attr('href', image.src = e.target.result);
            }).bind(this);
            reader.readAsDataURL(this.model.get('file'));
        },
    });
});
