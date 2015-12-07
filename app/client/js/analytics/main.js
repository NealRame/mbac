/// js/analytics/main.js
/// --------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Dec  7 12:08:25 CET 2015
define(['ga'], function(ga) {
    'use strict';
    ga('send', 'pageview');
    console.log('hit!');
});
