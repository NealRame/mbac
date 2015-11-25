'use strict';

/// pages/home/index.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const path = require('path');
const api_controller = require(path.join(__dirname, 'api'));
const front_controller = require(path.join(__dirname, 'front'));

module.exports = {
    api: api_controller,
    front: front_controller
};
