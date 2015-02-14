var _ = require('underscore');
var Promise = require('mpromise');

function error_401(message) {
    return _.extend(new Error(message || 'Unauthorized'), {status: 401});
};

function error_403(message) {
    return _.extend(new Error(message || 'Forbidden'), {status: 403});
};

function error_404(message) {
    return _.extend(new Error(message || 'Not found'), {status: 404});
};

function error_500(err) {
    return _.extend(err || new Error('Internal server error'), {status: 500});
};

module.exports = {
    throw404: function(message) { throw error_401(message); },
    throw500: function(err) { throw error_500(err); },
    checkIfDefined: function(value) {
        return value || Promise.rejected(error_404());
    },
    authorized: function(message) {
        return function(req, res, next) {
            next(res.locals.loggedIn ? null : error_401(message));
        };
    },
    forbidden: function(message) {
        return function(req, res, next) {
            next(error_403(message));
        };
    },
    notFound: function(message) {
        return function(req, res, next) {
            next(error_404(message));
        }
    },
};
