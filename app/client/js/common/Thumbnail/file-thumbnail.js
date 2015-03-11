// Thumbnail/file-thumbnail.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:37 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');

    return ThumbnailView.extend({
        onRender: function() {
            var image = new Image();
            var reader = new FileReader();

            image.onload = (function() {
                var canvas = document.createElement('canvas');
                var contex = canvas.getContext('2d');
                var geo = this.geometry(image);

                $(canvas)
                    .attr(_.pick(geo, 'width', 'height'))
                    .css(_.pick(geo, 'left', 'top'));
                contex.drawImage(image, 0, 0, geo.width, geo.height);

                this.ui.thumbLink.empty().append(canvas);
            }).bind(this);

            // Read the file data as DataURL and set image source
            reader.onload = (function(e) {
                this.ui.thumbLink.attr('href', image.src = e.target.result);
            }).bind(this);
            reader.readAsDataURL(this.model.get('file'));
        },
    });
});
