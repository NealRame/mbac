'use strict';

const api = require('common/api');
const express = require('express');
const GridFs = require('gridfs');
const mongo = require('mongoose').mongo;

const router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
    try {
        const gfs = new GridFs(mongo, req.db);
        const file_id = new mongo.ObjectID(req.params.id);
        gfs.existsAsync(file_id)
            .then((exist) => exist ? gfs.statAsync(file_id) : api.error404())
            .then((stats) => {
                res.type(stats.contentType);
                return gfs.createReadStream(file_id);
            })
            .then((stream) => {
                stream.pipe(res);
            })
            .catch((err) => next(err));
    } catch (err) {
        api.throw404();
    }
});

module.exports = router;
