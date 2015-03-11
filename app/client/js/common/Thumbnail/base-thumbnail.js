// Thumbnail/base-thumbnail.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:55:49 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var thumbnailTemplate = require('text!common/Thumbnail/thumbnail.html');

    return Marionette.ItemView.extend({
        className: 'thumb',
        ui: {
            crop: '.crop',
            thumbLink: '.thumb-link',
        },
        events: {
            'click @ui.thumbLink': 'onThumbLinkClicked'
        },
        serializedData: function() {
            return {};
        },
        template: _.template(thumbnailTemplate),
        templateHelpers: function() {
            return {
                width: this.options.width,
                height: this.options.height,
            };
        },
        initialize: function() {
            this.options.width = this.options.width || 128;
            this.options.height = this.options.height || 128;
        },
        onThumbLinkClicked: function(e) {
            console.log('thumbnail clicked!');
            if (this.options.onClick) {
                this.options.onClick(this.image);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        },
        geometry: function(image) {
            var height, crop_height = this.options.height;
            var width, crop_width = this.options.width;

            if (image && _.has(image, 'width') && _.has(image, 'height')) {
                var r = image.width/image.height;

                if (r > 1) {
                    // image.width < image.height
                    width = Math.max(crop_height*r, crop_width);
                    height = width/r;
                } else {
                    //image.width >= image.height
                    height = Math.max(crop_width/r, crop_height);
                    width = height*r;
                }
            } else {
                height = crop_height;
                width = crop_width;
            }

            return {
                width: width, height: height,
                left: (crop_width - width)/2, top: (crop_height - height)/2
            };
        }
    });
});
