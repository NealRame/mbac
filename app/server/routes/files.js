var express = require('express');
var mongo = require('mongoose').mongo;

var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
    var db = req.db;
    var file_id = new mongo.ObjectID(req.params.id);
    var GridStore = mongo.GridStore;

    GridStore.exist(db, file_id, function(err, exist) {
        if (err) {
            next(err);
        } else if (! exist) {
            next(Object.create(
                new Error('File not found'), {status: {value: 404}}
            ));
        } else {
            var grid_store = new GridStore(db, file_id, 'r');
            var stream = grid_store.stream();

            res.on('pipe', function() {
                res.type(grid_store.contentType);
            });
            stream.pipe(res);
        }
    });
});

module.exports = router;
