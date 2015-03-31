/// pages.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 31 19:50:23 CEST 2015

var _ = require('underscore');
var config = require('config');
var debug = require('debug')('mbac:pages');
var path = require('path');

function fatal_error(msg) {
    throw new Error(msg);
}

function require_page(name, part) {
    var module;
    var page = path.join('pages', name, part);
    try {
        module = require(page);
        if (! _.isFunction(module)) {
            fatal_error([page, 'must export a function!'].join(' '));
        }
    } catch (err) {
        throw err;
    }
    return module;
}

function setup_frontend(app, name, config) {
    if (config) {
        debug(['Setup front-end page:', route].join(' '));

        var page = require_page(name, 'front');
        var route = path.join('/', name);

        _.each(config.menu, function(entry) {
            app.locals.menu[entry.type].push({
                name: entry.name,
                page: name,
                slug: route
            });
        });
        app.get(route, function(req, res) {
            res.locals.page = {
                name: name
            };
            if (config.app) {
                res.locals.page.application = path.join('pages', config.app);
            }
            if (config.css) {
                res.locals.page.style = path.join('/styles', config.css);
            }
            page(req, res);
        });
    }
}

function setup_backend(app, name, config) {
    if (config) {
        debug(['Setup back-end page:', route].join(' '));

        var page = require_page(name, 'back');
        var route = path.join('/admin', name);

        app.locals.menu.admin.push({
            name: config.entry,
            page: name,
            slug: route
        });
        app.get(route, function(req, res) {
            res.locals.page =  {
                name: name
            };
            if (config.app) {
                res.locals.page.application = path.join('pages', config.app);
            }
            if (config.css) {
                res.locals.page.style = path.join('/styles', config.css);
            }
            page(req, res);
        });
    }
}

function setup_api(app, name, config) {
    if (config) {
        debug(['Setup api endpoints:', route].join(' '));

        var api = require_page(name, 'api');
        var route = path.join('/api', name);

        app.use(route, api);
    }
}

exports.setup = function(app) {
    app.locals.menu = {
        navbar: [],
        footer: [],
        admin:  []
    };
    _.each(config.pages, function(page_config, name) {
        setup_frontend(app, name, page_config.front);
        setup_backend(app, name, page_config.back);
        setup_api(app, name, page_config.api);
    });
};
