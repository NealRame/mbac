/// pages/home/notification-carousel.js
/// -----------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec  5 18:51:41 CET 2015
define(function(require) {
    'use strict';

    var $ = require('jquery');
    var notifications = $('#notifications ul');
    var notification_progress_bar = $('#notifications #notification-progress');

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

    function progress() {
        notification_progress_bar
            .width(0)
            .animate({width: '100%'}, 8000, 'linear', function() {
                next();
                progress();
            });
    }

    $('.next', notifications).click(next);
    $('.prev', notifications).click(prev);
    $('.notification-close', notifications).click(function(ev) {
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
    notifications.children().each(function(index, notification) {
        $(notification).css({left: index*notifications.width()});
    });
    progress();
});
