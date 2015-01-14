/// db.js
/// ======
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date: Wed Jan 14 22:49:30 CET 2015
///
/// The function of the middleware _'db'_ is to initialize the local variable
/// `db` of the request object.

var mongoose = require('mongoose');

/// ## Methods

/// ### module#setup(app)
///
/// Setups the middleware in the given application.
///
/// _Parameters_:
/// * `app` _[required]_, an express app object.
exports.setup = function(app) {
    app.use(function(req, res, next) {
        req.db = mongoose.connection.db;
        next();
    });
};
