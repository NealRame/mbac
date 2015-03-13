// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var template = require('text!common/AchievementLightbox/achievement-lightbox.html');

    var ESC_KEY = 27;
    var PREV_KEY = 37;
    var NEXT_KEY = 39;

    return Marionette.ItemView.extend({
        className: 'achievement-lightbox',
        template: _.template(template),
        ui: {
            'thumbnails': '.thumbnails',
            'picture': '#picture',
            'actions': '.action'
        },
        events: {
            'click': 'close',
            'click .thumbnails > li > a': 'onThumbnailClick',
            'click @ui.picture > img': 'onPictureClick',
            'click @ui.actions': 'onActionRequest'
        },
        initialize: function() {
            var resize_cb = this.onWindowResized.bind(this);
            var keyup_cb = this.onKeypress.bind(this);
            this.once('opened', $(window).on.bind($(window),  'resize', resize_cb));
            this.once('closed', $(window).off.bind($(window), 'resize', resize_cb));
            this.once('opened', $(window).on.bind($(window),  'keyup', keyup_cb));
            this.once('closed', $(window).off.bind($(window), 'keyup', keyup_cb));
            this.count = this.model.get('pictures').length;
            this.current = 0;
        },
        onKeypress: function(e) {
            // console.log(e.which);
            e.preventDefault();
            e.stopPropagation();
            switch (e.which) {
            case ESC_KEY:
                this.close();
                break;
            case NEXT_KEY:
                this.showNextPicture();
                break;
            case PREV_KEY:
                this.showPreviousPicture();
                break;
            }
            return false;
        },
        onActionRequest: function(e) {
            e.preventDefault();
            e.stopPropagation();
            switch ($(e.currentTarget).attr('data-action')) {
            case 'next':
                this.showNextPicture();
                break;
            case 'prev':
                this.showPreviousPicture();
                break;
            default:
                break;
            }
            return false;
        },
        onThumbnailClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.showPicture($(e.currentTarget).attr('data-index'));
            return false;
        },
        onPictureClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.showNextPicture();
            return false;
        },
        onWindowResized: function(e) {
            this.setGeometry();
        },
        setGeometry: function() {
            var viewport = {
                width: $(window).width(),
                height: this.ui.thumbnails.offset().top
            };

            this.ui.picture.css(viewport);

            var spinner = this.ui.picture.find('i');
            var spinner_elt = spinner.get(0);
            if (spinner_elt) {
                spinner.css({
                    position: 'absolute',
                    left: (viewport.width - spinner.width())/2,
                    top: (viewport.height - spinner.height())/2
                });
            }

            var img = this.ui.picture.find('img');
            var img_elt = img.get(0);
            if (img_elt) {
                var max_w = viewport.width  - 32;
                var max_h = viewport.height - 32;
                var w = img_elt.naturalWidth;
                var h = img_elt.naturalHeight;
                var r = w/h;

                if (r > 1) {
                    w = Math.min(max_w, w);
                    h = w/r;
                    if (h > max_h) {
                        h = max_h;
                        w = h*r;
                    }
                } else {
                    h = Math.min(max_h, h);
                    w = r*h;
                    if (w > max_w) {
                        w = max_w;
                        h = w/r;
                    }
                }

                img.css({
                    left: (viewport.width - w)/2,
                    top: (viewport.height - h)/2,
                    width: w,
                    height: h,
                });
            }

            this.ui.thumbnails.css({
                left: (viewport.width - this.ui.thumbnails.width())/2
            });
        },
        showNextPicture: function() {
            this.showPicture((this.current + 1) % this.count);
        },
        showPreviousPicture: function() {
            this.showPicture((this.current - 1 + this.count) % this.count);
        },
        showPicture: function(index) {
            this.current = index;
            this.ui.picture.empty().append(
                $(document.createElement('i'))
                    .addClass('fa fa-spin fa-5x fa-circle-o-notch')
            );
            this.setGeometry();

            var img = document.createElement('img');

            img.onload = (function() {
                this.ui.picture.empty().append($(img).css({
                    border: '4px solid white',
                    position: 'absolute',
                }));
                this.setGeometry();
            }).bind(this);
            img.src = '/files/' + this.model.get('pictures')[index].original;
        },
        run: function() {
            $('body').append(this.render().el);
            this.open();
        },
        open: function() {
            this.$el.fadeIn((function() {
                this.trigger('opened');
                this.showPicture(0);
            }).bind(this));
        },
        close: function() {
            this.$el.fadeOut((function() {
                this.remove();
                this.trigger('closed');
            }).bind(this));
        },
    });
});
