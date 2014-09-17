/// menu.js
/// =========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date: Wed Sep 17 14:00:05 CEST 2014
///
/// The function of the middleware Menu is to initialize the local variable
/// `pages` of the response object.
/// Suppose you have 2 pages:
/// * '/pages/foo' indexed in 'top-bar',
/// * '/pages/buzz' indexed in 'footer',
/// (see 'model/Page' for more details about page indexes). The middleware
/// will set the response local variable `pages` like the following:
///   ```javascript
///   {
///       `top-bar`: [{_id: '/pages/foo', title: 'Foo'}],
///       'footer':  [{_id: '/pages/bar', title: 'Bar'}]
///   }
///   ```
/// For each index the pages are sorted according to their rank.

var _ = require('underscore');
var Page = require('models/page');

/// ## Methods

/// ### module#setup(app)
///
/// Setups the middleware in the given application.
///
/// _Parameters_:
/// * `app` _[required]_, an express app object.
exports.setup = function(app) {
    app.user(function(req, res, next) {
        Page
            .list({index: /(?:top-bar)|(?:footer)/, published: true})
            .then(function(pages) {
                res.locals.path = req.path;
                res.locals.pages = _.groupBy(pages, 'index');
                next();
            })
            .then(null, next);
    });
};
