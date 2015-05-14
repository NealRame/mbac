// common/AchievementLightbox/achievement-lightbox.js
// --------------------------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan 16 23:33:01 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Promise = require('promise');

    var async = require('common/async');
    var functional = require('common/functional');
    var ui = require('common/ui');
    var template = require('text!common/Lightbox/lightbox.html');

    var ESC_KEY = 27;
    var PREV_KEY = 37;
    var NEXT_KEY = 39;

    var Lightbox = Marionette.LayoutView.extend({
        className: 'lightbox',
        ui: {
            arrows: '#rewind,#forward',
            rewind: '#rewind',
            forward: '#forward',
            picture: '#picture',
        },
        events: {
            'click': 'close',
            'click @ui.picture > img': 'onPictureClick',
            'click @ui.picture > .error': 'onPictureClick',
            'click @ui.forward': 'onForwardClick',
            'click @ui.rewind': 'onRewindClick'
        },
        template: _.template(template),
        startIndex: 0,
        initialize: function() {
            this.count = this.collection.length;
            this.current = Math.min(Marionette.getOption(this, 'startIndex'), this.count)%this.count;
            this._cache = {};
            var keyup_cb = this.onKeypress.bind(this);
            var resize_cb = _.debounce(this.onWindowResized.bind(this), 100);
            var show_arrow_cb = _.debounce(
                this.count > 1
                    ? this.scheduleShowNavigationArrows.bind(this)
                    : _.noop,
                300,
                true
            );
            this.listenToOnce(this, 'opened', function() {
                this.$el.on('mousemove', show_arrow_cb);
                $(window).on('keyup', keyup_cb);
                $(window).on('resize', resize_cb);
            });
            this.listenToOnce(this, 'closed', function() {
                this.$el.off('mousemove', show_arrow_cb);
                $(window).off('keyup', keyup_cb);
                $(window).off('resize', resize_cb);
            });
        },
        loadImage: function(index) {
            var picture = this.collection.at(this.current);
            var cache = this._cache;
            return (functional.hasAllOfAttributes(picture, 'file')
                ? async.loadImage(picture.attributes.file)
                : async.loadImage(picture.originalURL())
            ).then(function(image) {
                return cache[index] = image;
            });
        },
        detachImage: function() {
            this.ui.picture.find('img').first().detach();
            this.ui.picture.append(this.spinner());
        },
        image: function() {
            try {
                if (this._cache[this.current]) {
                    return Promise.resolve(this._cache[this.current]);
                } else {
                    return this.loadImage(this.current);
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
            var viewport = ui.rect(this.el);

            this.ui.picture.css(viewport);

            var spinner = this.ui.picture.find('i');
            spinner.css(ui.center(ui.rect(spinner), viewport));

            var img = this.ui.picture.find('img');
            img.css(ui.center(ui.fit(ui.naturalRect(img), ui.scale(viewport, 0.96)), viewport));

            var error = this.ui.picture.find('.error');
            error.css(ui.center(ui.rect(error), viewport));

            if (this.$el.data('arrow-state') === 'visible') {
                var fwd = this.ui.forward;
                var rwd = this.ui.rewind;

                rwd.css(ui.vCenter(ui.rect(rwd), viewport));
                fwd.css(ui.vCenter(ui.rect(fwd), viewport));
            }
        },
        showNextPicture: function() {
            this.current = ((this.current + 1)%this.count);
            this.showPicture();
        },
        showPreviousPicture: function() {
            this.current = ((this.current - 1 + this.count)%this.count);
            this.showPicture();
        },
        showPicture: function() {
            debugger;
            this.detachImage();
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
                this.showPicture();
            }).bind(this));
        },
        close: function() {
            this.$el.fadeOut((function() {
                this.remove();
                this.trigger('closed');
            }).bind(this));
        },
        onForwardClick: function(e) {
            this.onArrowClick(e, true);
        },
        onRewindClick: function(e) {
            this.onArrowClick(e, false);
        },
        onArrowClick: function(e, forward) {
            e.preventDefault();
            e.stopPropagation();
            this.scheduleHideNavigationArrows();
            if (forward) {
                this.showNextPicture();
            } else {
                this.showPreviousPicture();
            }
            return false;
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
        scheduleHideNavigationArrows: function() {
            var fwd = this.ui.forward;
            var rwd = this.ui.rewind;
            var lightbox = this.$el;
            var timeout_id = lightbox.data('arrow-timeout-id');
            var state = lightbox.data('arrow-state');

            if (timeout_id) {
                clearTimeout(timeout_id);
            }

            if (state === 'visible') {
                timeout_id = setTimeout(function() {
                    lightbox.data('arrow-state', 'pending');
                        Promise.join(
                            rwd.animate({
                                left: 0,
                                opacity: 0,
                            }, 250).promise(),
                            fwd.animate({
                                right: -fwd.width(),
                                opacity: 0,
                            }, 250).promise()
                        )
                        .then(function() {
                            lightbox
                                .data('arrow-state', 'hidden')
                                .removeData('arrow-timeout-id');
                        });
                }, 5000);
                lightbox.data('arrow-timeout-id', timeout_id);
            }
        },
        scheduleShowNavigationArrows: function() {
            var lightbox = this.$el;
            var state = lightbox.data('arrow-state') || 'hidden';

            if (state === 'hidden') {
                var fwd = this.ui.forward;
                var rwd = this.ui.rewind;
                var viewport = ui.rect(lightbox);

                lightbox.data('arrow-state', 'pending');
                this.ui.arrows.css('display', 'block');

                var rwd_rect = ui.rect(rwd);
                var fwd_rect = ui.rect(fwd);

                rwd.css(_.extend(
                    ui.vCenter(rwd_rect, viewport), {
                        left: -rwd_rect.width,
                        opacity: 0
                    })
                );
                fwd.css(_.extend(
                    ui.vCenter(fwd_rect, viewport), {
                        right: -fwd_rect.width,
                        opacity: 0
                    })
                );
                Promise.join(
                    rwd.animate({
                        left: 64,
                        opacity: 1,
                    }, 250).promise(),
                    fwd.animate({
                        right: 64,
                        opacity: 1,
                    }, 250).promise()
                )
                .bind(this)
                .then(function() {
                    lightbox.data('arrow-state', 'visible');
                    this.scheduleHideNavigationArrows();
                });
            } else if (state === 'visible') {
                this.scheduleHideNavigationArrows();
            }
        }
    });

    Lightbox.open = function(collection, start_index) {
        start_index = start_index || 0;
        var lightbox;
        if (collection instanceof Backbone.Collection) {
            lightbox = new Lightbox({
                collection: collection,
                startIndex: start_index
            });
        } else if (_.isArray(collection)) {
            lightbox = new Lightbox({
                collection: new Backbone.Collection(collection),
                startIndex: start_index
            });
        } else if (collection instanceof Backbone.Model) {
            lightbox = new Lightbox({
                collection: new Backbone.Collection([collection]),
                startIndex: start_index
            });
        } else {
            throw new TypeError('Need a an array or a collection of pictures or a single picture model');
        }
        lightbox.run();
    };

    return Lightbox;
});
