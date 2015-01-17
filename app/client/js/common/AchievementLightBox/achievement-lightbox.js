// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var template = require('text!common/AchievementLightbox/achievement-lightbox.template.html');

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
            'click @ui.actions': 'onActionRequest',
        },
        initialize: function() {
            this.count = this.model.get('pictures').length;
            this.current = 0;
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
        showNextPicture: function() {
            this.showPicture((this.current + 1) % this.count);
        },
        showPreviousPicture: function() {
            this.showPicture((this.current - 1 + this.count) % this.count);
        },
        showPicture: function(index) {
            console.log('showing:', index);
            console.log(this.ui.picture.find());

            this.current = index;

            var viewport = {
                width: $(window).width(),
                height: this.ui.thumbnails.offset().top
            };

            var spinner =
                $(document.createElement('i'))
                    .addClass('fa fa-spin fa-5x fa-circle-o-notch');

            this.ui.picture.empty().css(viewport).append(
                spinner.css({
                    position: 'absolute',
                    left: (viewport.width - spinner.width())/2,
                    top: (viewport.height - spinner.height())/2
                }));

            var img = document.createElement('img');

            img.onload = (function() {
                var max_w = viewport.width  - 32;
                var max_h = viewport.height - 32;
                var w = img.width, h = img.height, r = w/h;

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

                $(img).css({
                    border: '4px solid white',
                    position: 'absolute',
                    left: (viewport.width - w)/2,
                    top: (viewport.height - h)/2,
                    width: w,
                    height: h,
                });

                this.ui.picture.empty().append(img);
            }).bind(this);

            img.src = '/files/' + this.model.get('pictures')[index].original;
        },
        open: function() {
            this.$el.fadeIn(this.showPicture.bind(this, 0));
        },
        close: function() {
            this.$el.fadeOut(this.remove.bind(this));
        },
    });
});
