/* global Foundation: false */
/// pages/home/notification-carousel.js
/// -----------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec  5 18:51:41 CET 2015
define(function(require) {
    'use strict';

    //- .notification-paging
    //-     a.prev: i.fa.fa-caret-left
    //-     <span></span>
    //-     a.next: i.fa.fa-caret-right

    require('foundation');
    var $ = require('jquery');
    var Promise = require('promise');
    var notifications = $('#notifications ul');
    var notification_close_button = $('#notifications .notification-close');
    var notification_progress_bar = $('#notifications #notification-progress');

    function left(elt) {
        return parseFloat($(elt).css('left'));
    }

    function reflow() {
        var children = $(notifications).children();
        children
            .sort(function(elt1, elt2) {
                return left(elt1) - left(elt2);
            })
            .each(function(index, notification) {
                $(notification).css({left: index*notifications.width()});
            });
    }

    function next() {
        var width = notifications.width();
        var children = notifications.children();
        return Promise.all(
            children.map(function(index, notification) {
                notification = $(notification);
                return $(notification)
                    .animate({left: left(notification) - width})
                    .promise()
                    .then(function() {
                        if (left(notification) < 0) {
                            notification.css({left: (children.length - 1)*width});
                        }
                    });
            }).toArray()
        );
    }

    function prev() {
        var width = notifications.width();
        var children = notifications.children();
        return Promise.all(
            children.map(function(index, notification) {
                notification = $(notification);
                var offset = left(notification);
                if (offset >= (children.length - 1)*width) {
                    offset = -width;
                    notification.css({left: offset});
                }
                return notification.animate({left: offset + width}).promise();
            }).toArray()
        );
    }

    function progress(duration) {
        notification_progress_bar
            .width(0)
            .animate({width: '100%'}, duration, 'linear', function() {
                next().then(function() {
                    progress(duration);
                });
            });
    }

    $('.next', notifications).click(next);
    $('.prev', notifications).click(prev);
    notification_close_button.click(function(ev) {
        $(this).off();
        notification_progress_bar.stop().width(0);
        notifications
            .parent()
            .animate({opacity: 0}, 250)
            .promise()
            .then(function(element) {
                return element.animate({height: 0}, 250).promise();
            })
            .then(function(element) {
                element.remove();
            });
        ev.stopPropagation();
        ev.preventDefault();
    });
    $(window).bind('resize', Foundation.utils.throttle(reflow, 150));
    notifications.children().each(function(index, notification) {
        $(notification).css({left: index*notifications.width()});
    });
    progress(8000);
});
