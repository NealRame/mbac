'use strict';

/// pages.js
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:06:10 CEST 2015

const path = require('path');
const api_controller = require(path.join(__dirname, 'api'));
const front_controller = require(path.join(__dirname, 'front'));

module.exports = {
    api: api_controller,
    front: front_controller
};
