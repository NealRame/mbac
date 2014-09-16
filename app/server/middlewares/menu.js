var _ = require('underscore');
var Page = require('models/page');

module.exports = function(req, res, next) {
    Page
        .list({index: /(?:top-bar)|(?:footer)/, published: true})
        .then(function(pages) {
            res.locals.path = req.path;
            res.locals.pages = _.groupBy(pages, 'index');
            next();
        })
        .then(null, next);
};
