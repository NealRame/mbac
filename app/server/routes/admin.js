// admin.js
// ========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Oct 22 22:40:49 CEST 2014

var express = require('express');
var router = express.Router();

/* GET admin page. */
router.get('/', function(req, res) {
    res.render(
        'admin',
        {
            title:  'mon Bar à Couture - l\'arrière boutique',
            script: 'app/admin_main'
        }
    );
});

module.exports = router;
