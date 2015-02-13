// api/index.js
// ------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Mar 18 nov 2014 20:11:04 CET

var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
    req.api = true;
    next();
});
router.use('/achievements', require('routes/api/achievements'));
router.use('/pictures', require('routes/api/pictures'));

module.exports = router;
