// api/index.js
// ------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mar 18 nov 2014 20:11:04 CET

var _ = require('underscore');
var express = require('express');
var router = express.Router();

router.use('/achievements', require('routes/api/achievements'));

module.exports = router;
