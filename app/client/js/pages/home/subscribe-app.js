/// pages/home/subscribe-app.js
/// -----------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec  5 19:07:31 CET 2015
define(function(require) {
    'use strict';

    var $ = require('jquery');
    var SubscribeDialog = require('pages/home/subscription/subscribe-dialog');

    $('#subscribe').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        SubscribeDialog.open();
        return false;
    });
});
