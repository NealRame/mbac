// Thumbnail/file-thumbnail.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:37 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var async = require('utils/async');
    var ThumbnailView =  require('common/Thumbnail/base-thumbnail');

    return ThumbnailView.extend({
        renderThumbnail: function() {
            var file = this.model.get('file');
            return async.loadDataURL(file)
                .then(async.loadImage)
                .bind(this)
                .then(function(image) {
                    var canvas = document.createElement('canvas');
                    var contex = canvas.getContext('2d');
                    var geo = this.geometry(image);

                    $(canvas)
                        .attr(_.pick(geo, 'width', 'height'))
                        .css(_.pick(geo, 'left', 'top'));
                    contex.drawImage(image, 0, 0, geo.width, geo.height);

                    return {
                        el: canvas,
                        target: image.src
                    };
                })
                .catch(function(err) {
                    throw new Error('Error while load file: ' + file.name);
                });
        }

    });
});
