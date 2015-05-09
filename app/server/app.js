var _ = require('underscore');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('mbac:app');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var Promise = require('Promise');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var session = require('express-session');
var Store = require('mongoose-express-session-store');

var app;

exports.instance = function() {
    if (app) {
        return Promise.resolve(app);
    }

    var config = require('config');

    return (new Promise(
        function(resolve, reject) {
            mongoose.connect(config.database.fullURI).connection
                .once('error', reject)
                .once('open', resolve);
        })
    ).then(function(conn) {
        debug('Connected to db at ' + config.database.URI);

        app = express();

        // Configuration setup
        app.set('config', config);
        app.set('debug', debug);

        // View engine setup
        app.set('view engine', 'jade');
        app.set('views', path.join(__dirname, 'views'));

        // Application locals setup
        app.locals.basedir = app.get('views');
        app.locals.menu = {
            topbar: [],
            footer: [],
            admin:  []
        };

        // Middlewares setup
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(cookieParser());
        app.use(session({store: new Store(), secret: 'IL0veK4t', proxy: true, resave: true, saveUninitialized: true}));
        app.use(serveFavicon(path.join(__dirname, '..', '..', 'public', 'mbac.ico')));
        app.use(serveStatic(path.join(__dirname, '..', '..', 'public')));
        app.use('/api', function(req, res, next) {
            req.api = true;
            next();
        });

        require('middlewares/auth').setup(app);
        require('middlewares/db').setup(app);

        // Routes setup
        app.use('/admin', require('routes/admin'));
        app.use('/api',   require('routes/api'));
        app.use('/files', require('routes/files'));

        // Pages setup
        require('pages').setup(app);

        // Error handlers setup

        // - catch 404 and forward to error handler
        app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // - development env will print stacktrace
        app.use(function(err, req, res, next) {
            var error = _.defaults(
                _.pick(err, 'message', 'status'),
                {
                    message: 'Internal server error',
                    status: 500
                }
            );

            if (app.get('env') === 'development' && err.stack) {
                error.stack = err.stack;
            }

            res.status(error.status);

            if (req.api) {
                // TODO log error
                debug(error.message);
                // debug(error.stack);
                res.send(error);
            } else {
                res.render('error', {
                    error: error,
                    page: {
                        name: 'error',
                        stylesheets: ['/css/style.css']
                    }
                });
            }
        });

        return app;
    });
};
