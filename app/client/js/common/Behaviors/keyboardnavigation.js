// common/Behaviors/touchnavigation.js
// -----------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Jun 24 23:28:05 CEST 2015
define(function(require) {
    'use strict';
    var Marionette = require('marionette');

    var ESC_KEY  = 27;
    var PREV_KEY = 37;
    var NEXT_KEY = 39;

    return Marionette.Behavior.extend({
        onKeypressed: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            switch (ev.which) {
                case ESC_KEY:
                    this.view.triggerMethod('closeRequest');
                    break;
                case NEXT_KEY:
                    this.view.triggerMethod('nextItem');
                    break;
                case PREV_KEY:
                    this.view.triggerMethod('previousItem');
                    break;
                default:
                    break;
            }
            return false;
        }
    });
});
