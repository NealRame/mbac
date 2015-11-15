'use strict';

/// api/index.js
/// ------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mar 18 nov 2014 20:11:04 CET

const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    req.api = true;
    next();
});
router.use('/pictures', require('routes/api/pictures'));

module.exports = router;
