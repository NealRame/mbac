// common/Behaviors/touchnavigation.js
// -----------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Jun 24 23:09:11 CEST 2015
define(function(require) {
    'use strict';
    var Marionette = require('marionette');
    return Marionette.Behavior.extend({
        events: {
            'touchstart @ui.touchZone': 'onTouchStart',
            'touchend @ui.touchZone': 'onTouchEnd',
            'touchmove @ui.touchZone': 'onTouchMove'
        },
        onTouchStart: function(ev) {
            var touch = ev.originalEvent.changedTouches[0];
            ev.preventDefault();
            ev.stopPropagation();
            if (!this.touchOrigin) {
                this.touchOrigin = {
                    id: touch.identifier,
                    x: touch.screenX
                };
            }
            return false;
        },
        onTouchEnd: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.touchOrigin) {
                Marionette.triggerMethod.call(
                    this.view,
                    'closeRequest'
                );
                delete this.touchOrigin;
            }
            return false;
        },
        onTouchMove: function(ev) {
            var touch = ev.originalEvent.changedTouches[0];
            ev.preventDefault();
            ev.stopPropagation();
            if (this.touchOrigin.id === touch.identifier) {
                Marionette.triggerMethod.call(
                    this.view,
                    this.touchOrigin.x < touch.screenX
                        ? 'nextItem'
                        : 'previousItem'
                );
                delete this.touchOrigin;
            }
            return false;
        }
    });
});
