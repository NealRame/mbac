'use strict';

/// admin.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Oct 22 22:40:49 CEST 2014

const express = require('express');
const router = express.Router();

/* GET admin page. */
router
    .get('/', (req, res) => res.render('admin', {
        title: 'mon Bar à Couture - l\'arrière boutique',
        page: {
            name: 'admin',
            stylesheets: ['/css/admin_style.css']
        }
    }));
module.exports = router;
