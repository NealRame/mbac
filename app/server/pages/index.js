/// pages.js
/// ========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 31 19:50:23 CEST 2015

var _ = require('underscore');
var config = require('config');
var debug = require('debug')('mbac:pages');
var fs = require('fs');
var path = require('path');

function prefix(path_prefix, paths) {
    if (_.isString(paths)) {
        return path.join(path_prefix, paths);
    }
    if (_.isArray(paths)) {
        return _.map(paths, prefix.bind(null, path_prefix));
    }
    throw new TypeError('Wrong type of argument!');
}

function get_page_controllers(name) {
    var controllers_path = path.join(__dirname, name);
    if (fs.existsSync(path.join(controllers_path, 'index.js'))) {
        debug(['- custom controllers:', controllers_path].join(' '));
        return require(controllers_path);
    }
    debug('- no custom controllers found.');
    return {};
}

function setup_page(app, name, controller, config) {
    var page = {
        name: name,
    };
    var route = (name === 'home' && config.prefix === '/') ? '/' : path.join(config.prefix, name);
    var template = path.join(__dirname, name, 'views', config.template);

    debug(['- initialize route', route].join(' '));

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
    if (config.stylesheets) {
        page.stylesheets = prefix('/css', config.stylesheets);
    }

    var locals = {
        page: page,
        title: config.title
    };

    // Setup page controller
    if (controller) {
        debug('  - setup custom controller', route);
        app.use(route, function(req, res, next) {
            _.extend(res.locals, locals);
            next();
        });
        app.use(route, controller);
    } else {
        debug('  - setup default controller');
        app.get(route, function(req, res) {
            _.extend(res.locals, locals);
            res.render(template);
        });
    }
}

function setup_api(app, name, controller) {
    var module;
    var module_path = path.join('pages', name, 'api');
    var route = path.join('/api', name);

    debug(['- initialize api', route].join(' '));
    app.use(route, controller);
}

exports.setup = function(app) {
    _.each(config.pages, function(page_config, name) {
        debug(['Setup page', name].join(' '));
        try {
            var page_controllers = get_page_controllers(name);
            if (page_config.back) {
                setup_page(app, name, page_controllers.back, _.extend(page_config.back, {
                    menu: {
                        admin: page_config.back.menu || name
                    },
                    prefix: '/admin',
                    stylesheets: [
                        'admin_style.css',
                    ].concat(prefix('pages', page_config.back.stylesheets || [])),
                    template: 'back.jade',
                }));
            }
            if (page_config.front) {
                setup_page(app, name, page_controllers.front, _.extend(page_config.front, {
                    prefix: '/',
                    stylesheets: [
                        'style.css',
                    ].concat(prefix('pages', page_config.front.stylesheets || [])),
                    template: 'front.jade',
                }));
            }
            if (page_controllers.api) {
                setup_api(app, name, page_controllers.api);
            }
        } catch (err) {
            // TODO log error
            console.log(err);
        }
    });
};
