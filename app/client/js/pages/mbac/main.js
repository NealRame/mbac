define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var async = require('common/async');
    var ui = require('common/ui');
    var Promise = require('promise');

    var __lock = true;

    function lock(elt, fun) {
        if (! $(elt).data('locked')) {
            $(elt).data('locked', true);
            fun.call(elt, unlock.bind(null, elt));
        }
    }

    function unlock(elt) {
        $(elt).data('locked', false);
    }

    function image_wrappers() {
        return $('.responsive-picture-wrapper');
    }

    Promise.all(_.map($('.responsive-picture-wrapper > img'), function(img) {
        return new Promise(function(resolve, reject) {
            var rect = ui.naturalRect(img);
            if (rect.width === 0 && rect.height === 0) {
                img.onload = function(ev) {
                    resolve(ev.target.result);
                };
                img.onerror = reject;
            } else {
                return resolve(img);
            }
        });
    })).then(function(res) {
        $(document).on('after-height-change.fndtn.equalizer', function(ev) {
            image_wrappers().each(function() {
                lock(this, function(next) {
                    var $img = $(this).find('img');
                    var image_rect = ui.naturalRect($img);
                    var wrapper_rect = ui.naturalRect(this);

                    $(this).css(wrapper_rect);
                    $img.css(ui.cropFit(image_rect, wrapper_rect));

                    next();
                });
            });
        });
        $(document).foundation();
    }).catch(function(err) {
        console.log(err);
    });

    // $(window).resize(function() {
    //     console.log(Foundation.utils.is_medium_only());
    // });
});
