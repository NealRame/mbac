// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Promise = require('promise');

    var async = require('utils/async');
    var functional = require('utils/functional');
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
        childEvents: {
            'ready': 'onChildReady'
        },
        initialize: function() {
            this._ready = 0;
        },
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
        onChildReady: function() {
            if (++this._ready >= this.collection.length) {
                this.trigger('ready');
            }
        },
        onShow: function() {

        },
    });

    var Lightbox = Marionette.LayoutView.extend({
        className: 'lightbox',
        thumbnailHeight: 131,
        thumbnailWidth: 196,
        thumbnailMargin: 4,
        ui: {
            picture: '#picture',
            rewind: '#rewind',
            forward: '#forward',
        },
        events: {
            'click': 'close',
            'click @ui.picture > img': 'onPictureClick',
            'click @ui.picture > .error': 'onPictureClick',
            'mousemove': 'onMouseMove'
        },
        template: _.template(template),
        initialize: function() {
            var resize_cb = this.onWindowResized.bind(this);
            var keyup_cb = this.onKeypress.bind(this);
            this.once('opened', $(window).on.bind($(window),  'resize', resize_cb));
            this.once('closed', $(window).off.bind($(window), 'resize', resize_cb));
            this.once('opened', $(window).on.bind($(window),  'keyup', keyup_cb));
            this.once('closed', $(window).off.bind($(window), 'keyup', keyup_cb));
            this.count = this.collection.length;
            this.current = 0;
        },
        image: function() {
            try {
                if (Math.random() > 0.5) {
                    throw new Error();
                }
                var picture = this.collection.at(this.current);
                if (functional.hasAllOfAttributes(picture, 'file')) {
                    return async.loadImage(picture.attributes.file);
                } else {
                    return async.loadImage(picture.originalURL());
                }
            } catch (err) {
                return Promise.reject(err);
            }
        },
        error: function() {
            return $(document.createElement('p'))
                .addClass('error')
                .html('Une erreur est survenue lors du chargement de l\'image!');
        },
        spinner: function() {
            return $(document.createElement('i'))
                .addClass('fa fa-spin fa-5x fa-circle-o-notch spinner');
        },
        setGeometry: function() {
            var viewport = ui.rect(window);

            this.ui.picture.css(viewport);

            var spinner = this.ui.picture.find('i');
            spinner.css(ui.center(ui.rect(spinner), viewport));

            var img = this.ui.picture.find('img');
            img.css(ui.center(ui.fit(ui.naturalRect(img), ui.scale(viewport, 0.96)), viewport));

            var error = this.ui.picture.find('.error');
            error.css(ui.center(ui.rect(error), viewport));

            // var rewind = this.ui.rewind;
            // rewind.css(_.extend(ui.vCenter(ui.rect(rewind), viewport), {left: 16}));
            //
            // var forward = this.ui.forward;
            // forward.css(_.extend(ui.vCenter(ui.rect(forward), viewport), {right: 16}));
        },
        showNextPicture: function() {
            this.showPicture((this.current + 1) % this.count);
        },
        showPreviousPicture: function() {
            this.showPicture((this.current - 1 + this.count) % this.count);
        },
        showPicture: function(index) {
            this.current = index;
            this.ui.picture.empty().append(this.spinner());
            this.setGeometry();
            this.image()
                .bind(this)
                .then(function(image) {
                    this.ui.picture.empty().append(image);
                })
                .catch(function(err) {
                    this.ui.picture.empty().append(this.error());
                })
                .finally(function() {
                    this.setGeometry();
                });
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
        onPictureClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.showNextPicture();
            return false;
        },
        onWindowResized: function(e) {
            this.setGeometry();
        },
        onMouseMove: function(e) {
            var rwd = this.ui.rewind;
            var fwd = this.ui.forward;
            var viewport = ui.rect(this.$el);

            var state = rwd.data('state') || 'hidden';

            if (state === 'hidden') {
                $(rwd).add(fwd).css('display', 'block').data('state', 'pending');

                var rwd_rect = ui.rect(rwd);
                var fwd_rect = ui.rect(fwd);

                rwd.css(_.extend(ui.vCenter(rwd_rect, viewport), {left: -rwd_rect.width}));
                fwd.css(_.extend(ui.vCenter(fwd_rect, viewport), {right: -fwd_rect.width}));

                Promise.join(
                    rwd.animate({
                        left: 64,
                        opacity: 1,
                    }, 150).promise(),
                    fwd.animate({
                        right: 64,
                        opacity: 1,
                    }, 150).promise()
                )
                .then(function() {
                    console.log('wait for 5 seconds');
                    $(rwd).add(fwd).data('state', 'visible').delay(5000).fadeOut(function() {
                        console.log('1. pouet pouet');
                        $(rwd).add(fwd).data('state', 'hidden');
                    });
                });
            } else if (state === 'visible') {
                console.log('5 seconds more!');

                $(rwd).add(fwd).clearQueue('fx').show().delay(5000).fadeOut(function() {
                    console.log('2. pouet pouet');
                    $(rwd).add(fwd).data('state', 'hidden');
                });
            }

            console.log(state);
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
