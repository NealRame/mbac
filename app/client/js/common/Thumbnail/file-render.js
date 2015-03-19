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
    var functional = require('utils/functional');
    var ui = require('utils/ui');

    return function(model) {
        if (functional.hasAllOfAttributes(model, 'file')) {
            var file = model.get('file');
            return async.loadImage(file)
                .bind(this)
                .then(function(image) {
                    var canvas = document.createElement('canvas');
                    var contex = canvas.getContext('2d');
                    var rect = this.thumbnailInnerRect();
                    var geo = ui.center(ui.cropFit(ui.naturalRect(image), rect), rect);

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
    };
});
