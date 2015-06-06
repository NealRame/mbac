/*global Foundation: false*/
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Promise = require('promise');
    var SubscribeDialog = require('pages/home/subscribe-dialog');
    var async = require('common/async');
    var functional = require('common/functional');
    var ui = require('common/ui');

    var __lock = true;

    function lock() {
        if (__lock) {
            __lock = false;
            return true;
        }
        return false;
    }

    function unlock() {
        __lock = true;
    }

    function load_image(figure) {
        return (figure.find('img').first().length > 0
            ? Promise.resolve(figure)
            : async.loadImage(figure.data('uri'))
                .then(function(image) {
                    figure.append(image);
                    return figure;
                })
        );
    }

    function fit_image(figure) {
        figure.show().height(Math.round(2*figure.width()/3));
        var image = figure.find('img');
        var fig_rect = functional.mapObject(ui.naturalRect(figure), function(v) {
            return v - 8;
        });
        $(image).css(
            ui.center(ui.cropFit(ui.naturalRect(image), fig_rect), fig_rect)
        );
        return figure;
    }

    function update_figures() {
        if (lock()) {
            Promise.all(_.map($('#achievements > li.thumb .crop'), function(fig) {
                var figure = $(fig);
                return load_image(figure).then(fit_image);
            })).then(unlock);
        }
    }

    update_figures();
    $(window).bind('resize', Foundation.utils.throttle(update_figures, 150));
    $('#subscribe').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        SubscribeDialog.open();
        return false;
    });
});
