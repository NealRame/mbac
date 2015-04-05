/// pages.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:06:10 CEST 2015

var path = require('path');

var api_controller = require(path.join(__dirname, 'api'));
var front_controller = require(path.join(__dirname, 'front'));

module.exports = {
    api: api_controller,
    front: front_controller
};
