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

    var notifications = $('#notifications ul');
    var notification_progress_bar = $('#notifications #notification-progress');

    $('.notification-close').click(function(ev) {
        $(this).off().parent().animate({opacity: 0}, 250)
            .promise()
            .then(function(notification) {
                notification.remove();
            })
            .then(function() {
                if (notifications.children().length === 0) {
                    notifications.animate({height: 0}, 250, function() {
                        notifications.remove();
                    });
                }
            });
        ev.stopPropagation();
        ev.preventDefault();
    });

    function left(elt) {
        return parseFloat($(elt).css('left'));
    }

    function next() {
        var width = notifications.width();
        var children = notifications.children();
        children.each(function(index, notification) {
            notification = $(notification);
            $(notification)
                .animate({left: left(notification) - width})
                .promise()
                .then(function() {
                    if (left(notification) < 0) {
                        notification.css({left: (children.length - 1)*width});
                    }
                });
        });
    }

    function prev() {
        var width = notifications.width();
        var children = notifications.children();
        children.each(function(index, notification) {
            notification = $(notification);
            var offset = left(notification);
            if (offset >= (children.length - 1)*width) {
                offset = -width;
                notification.css({left: offset});
            }
            notification
                .animate({left: offset + width});
        });
    }

    notifications.children().each(function(index, notification) {
        $(notification).css({left: index*notifications.width()});
    });

    $('.next', notifications).click(next);
    $('.prev', notifications).click(prev);

    function progress() {
        notification_progress_bar
            .width(0)
            .animate({width: '100%'}, 5000, 'linear', function() {
                next();
                progress();
            });
    }

    progress();
});
