/// pages.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 31 19:50:23 CEST 2015

var _ = require('underscore');
var config = require('config');
var debug = require('debug')('mbac:pages');
var path = require('path');

function setup_page(app, name, config) {
    var page = {
        name: name,
    };
    var prefix = config.prefix;
    var route = (name === 'home' && prefix === '/') ? '/' : path.join(prefix, name);
    var template = path.join(__dirname, name, 'views', config.template);
    var page_title = config.title || name;

    debug(['Setup', route].join(' '));

    // Add this page to application menus
    _.each(config.menu, function(title, type) {
        app.locals.menu[type].push({
            page: name,
            slug: route,
            title: title,
        });
    });

    // The page custom application
    if (config.application) {
        page.application = path.join('pages', config.application);
    }

    // The page custom stylesheet
    if (config.stylesheet) {
        page.stylesheet = path.join('/css/pages', config.stylesheet);
    }

    // Setup page controller
    app.get(route, function(req, res) {
        res.render(template, {page: page, title: page_title});
    });
}

function setup_api(app, name, config) {
    var module;
    var module_path = path.join('pages', name, 'api');
    var route = path.join('/api', name);

    debug(['Setup', route].join(' '));

    try {
        module = require(module_path);
        if (! _.isFunction(module)) {
            throw new Error([module_path, 'must export a function!'].join(' '));
        }
    } catch (err) {
        throw err;
    }

    app.use(route, require_api(name));
}

exports.setup = function(app) {
    app.locals.menu = {
        topbar: [],
        footer: [],
        admin:  []
    };
    _.each(config.pages, function(page_config, name) {
        if (page_config.back) {
            setup_page(app, name, _.extend(page_config.back, {
                menu: {
                    admin: page_config.back.menu || name
                },
                prefix: '/admin',
                template: 'back.jade',
            }));
        }
        if (page_config.front) {
            setup_page(app, name, _.extend(page_config.front, {
                prefix: '/',
                template: 'front.jade',
            }));
        }
        if (page_config.api) {
            setup_api(app, name, page_config.api);
        }
    });
};