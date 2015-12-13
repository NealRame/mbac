'use strict';

/// pages/home/index.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const path = require('path');

module.exports = {
    api: require(path.join(__dirname, 'api')),
    front: require(path.join(__dirname, 'front'))
};
