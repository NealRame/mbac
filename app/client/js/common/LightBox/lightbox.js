// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var ui = require('utils/ui');
    var Thumbnail = require('Thumbnail');
    var template = require('text!common/Lightbox/lightbox.html');

    var ESC_KEY = 27;
    var PREV_KEY = 37;
    var NEXT_KEY = 39;

    var ThumbnailList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        thumbnailHeight: 131,
        thumbnailWidth: 196,
        thumbnailMargin: 4,
        childView: Thumbnail,
        childViewOptions: function() {
            return {
                tagName: 'li',
                height: Marionette.getOption(this, 'thumbnailHeight'),
                width: Marionette.getOption(this, 'thumbnailWidth'),
                margin: Marionette.getOption(this, 'thumbnailMargin'),
            };
        },
        onRender: function() {
            var thumb_count = this.collection.length;
            var thumb_width = Marionette.getOption(this, 'thumbnailWidth');
            var thumb_margin = Marionette.getOption(this, 'thumbnailMargin');
            var width = thumb_count*(thumb_width + 2*thumb_margin + 4);
            var max_width = $(window).width() - 32;

            this.$el.width(width);
        },
        onShow: function() {

        }
    });

    var Lightbox = Marionette.LayoutView.extend({
        className: 'lightbox',
        thumbnailHeight: 131,
        thumbnailWidth: 196,
        thumbnailMargin: 4,
        regions: {
            thumbnailsWrapper: '#thumbnails-wrapper'
        },
        ui: {
            thumbnailsWrapper: '#thumbnails-wrapper',
            thumbnails: '.thumbnails',
            picture: '#picture',
            actions: '.action'
        },
        events: {
            'click': 'close',
            'click .thumbnails > li > a': 'onThumbnailClick',
            'click @ui.picture > img': 'onPictureClick',
            'click @ui.actions': 'onActionRequest'
        },
        template: _.template(template),
        initialize: function() {
            var resize_cb = this.onWindowResized.bind(this);
            var keyup_cb = this.onKeypress.bind(this);
            this.once('opened', $(window).on.bind($(window),  'resize', resize_cb));
            this.once('closed', $(window).off.bind($(window), 'resize', resize_cb));
            this.once('opened', $(window).on.bind($(window),  'keyup', keyup_cb));
            this.once('closed', $(window).off.bind($(window), 'keyup', keyup_cb));
            this.thumbnailList = new ThumbnailList({
                collection: this.collection,
                thumbnailHeight: Marionette.getOption(this, 'thumbnailHeight'),
                thumbnailWidth:  Marionette.getOption(this, 'thumbnailWidth'),
                thumbnailMargin: Marionette.getOption(this, 'thumbnailMargin'),
            });
            this.listenTo(this.thumbnailList, 'childview:click', function(view) {
                this.showPicture(view._index);
            });
            this.count = this.collection.length;
            this.current = 0;
        },
        setGeometry: function() {
            var viewport = {
                width: $(window).width(),
                height: this.$('#navigator').offset().top
            };

            this.ui.picture.css(viewport);

            var spinner = this.ui.picture.find('i');
            spinner.css({
                position: 'absolute',
                left: (viewport.width  - spinner.width())/2,
                top:  (viewport.height - spinner.height())/2
            });

            var img = this.ui.picture.find('img');
            var target_rect = {
                height: viewport.height - 32,
                width:  viewport.width  - 32
            };
            img.css(ui.center(ui.fit(ui.imageSize(img), target_rect), viewport));

            this.ui.thumbnailsWrapper.css({
                width: (196 + 8 + 4)*Math.min(3, this.count) + 2, // FIXME no magic value please !
                margin: '0 auto'
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

            img.src = this.collection.at(index).originalURL();
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
        onKeypress: function(e) {
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
        onRender: function() {
            this.getRegion('thumbnailsWrapper').show(this.thumbnailList);
        }
    });

    Lightbox.open = function(collection) {
        var lightbox;
        if (collection instanceof Backbone.Collection) {
            lightbox = new Lightbox({
                collection: collection
            });
        } else if (_.isArray(collection)) {
            lightbox = new Lightbox({
                collection: new Backbone.Collection(collection)
            });
        } else if (collection instanceof Backbone.Model) {
            lightbox = new Lightbox({
                collection: new Backbone.Collection([collection])
            });
        } else {
            throw new TypeError('Need a an array or a collection of pictures or a single picture model');
        }
        lightbox.run();
    };

    return Lightbox;
});
