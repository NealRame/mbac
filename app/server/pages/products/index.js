'use strict';

/// Products page
/// =============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Apr  2 13:06:10 CEST 2015

const path = require('path');
const routes_path = path.join(__dirname, 'routes');

module.exports = {
    api: require(path.join(routes_path, 'api')),
    front: require(path.join(routes_path, 'products'))
};
