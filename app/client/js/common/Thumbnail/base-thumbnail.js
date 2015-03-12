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
        geometry: function(image) {
            var height, crop_height = this.options.height;
            var width, crop_width = this.options.width;

            if (image) {
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
        },
        placeholder: function(type, ratio) {
            ratio = ratio || 1;

            var classes = {
                spinner: 'fa fa-circle-o-notch fa-spin',
                empty: 'fa fa-ban fa-fw',
                error: 'fa fa-exclamation-circle fa-fw'
            };
            var width = this.options.width;
            var height = this.options.height;
            var font_size = (Math.min(width, height) - 32)*ratio;

            return $(document.createElement('i'))
                .addClass([classes[type] || 'fa fa-question-circle', type].join(' '))
                .css({
                    fontSize: font_size,
                    height: font_size,
                    left: (width - font_size)/2,
                    top: (height - font_size)/2,
                    width: font_size,
                });
        },
        onRender: function() {
            this.ui.thumbLink.empty().append(this.placeholder('spinner'));
            this.renderThumbnail()
                .bind(this)
                .then(function(thumbnail) {
                    this.ui.thumbLink
                        .empty()
                        .append(thumbnail.el || this.placeholder('empty'))
                        .attr('href', thumbnail.target);
                })
                .catch(function() {
                    this.ui.thumbLink.empty().append(this.placeholder('error'));
                });
        },
        onThumbLinkClicked: function(e) {
            console.log('thumbnail clicked!');
            if (this.options.onClick) {
                this.options.onClick(this.image);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });
});
