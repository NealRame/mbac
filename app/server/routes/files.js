var express = require('express');
var GridFs = require('gridfs-stream');
var mongo = require('mongoose').mongo;

var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
    var gfs = GridFs(req.db, mongo);

    gfs.collection('fs')
        .findOne(
            {_id: new mongo.ObjectID(req.params.id)},
            function(err, item) {
                if (err) {
                    return next(err);
                }

                if (! item) {
                    return next(Object.create(
                            new Error('File not found'),
                            {status: {value: 404}}
                        )
                    );
                }

                gfs.createReadStream({_id: req.params.id})
                    .pipe(res.type('image/jpeg'));
            }
        );
});

module.exports = router;
