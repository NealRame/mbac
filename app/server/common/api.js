'use strict';

/// common/api.js
/// =============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Apr  3 01:40:23 2015
///
/// Provides common helper for API controllers.

const _ = require('underscore');
const config = require('config');

function error(err, status) {
    if (_.isString(err)) {
        err = new Error(err);
    }
    err.status = status;
    return err;
}

function error_401(message) {
    if (_.isUndefined(message) || !_.isString(message)) {
        message = 'Unauthorized';
    }
    return error(message, 401);
}

function error_403(message) {
    if (_.isUndefined(message) || !_.isString(message)) {
        message = 'Forbidden';
    }
    return error(message, 403);
}

function error_404(message) {
    if (_.isUndefined(message) || !_.isString(message)) {
        message = 'Not Found';
    }
    return error(message, 404);
}

function error_500(err) {
    return error(
        (err instanceof Error) || _.isString(err)  ? err : 'Internal server Error', 500
    );
}

function is_authenticated(res) {
    if (config.env === 'development' && !!process.env.BYPASS_AUTH) {
        return true;
    }
    return res.locals.loggedIn;
}

function value(v) {
    return _.result({value: v}, 'value');
}

module.exports = {
    /// #### common.api.error401([message])
    /// Create a 401 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    ///
    /// **Returns:**
    /// - `Promise`.
    error401(message) {
        return Promise.reject(error_401(message));
    },
    /// #### common.api.throw401([message])
    /// Throw a 401 error with the given message.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    throw401(message) {
        throw error_401(message);
    },
    /// #### common.api.error403([message])
    /// Create a 403 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    ///
    /// **Returns:**
    /// - `Promise`.
    error403(message) {
        return Promise.reject(error_403(message));
    },
    /// #### common.api.throw403([message])
    /// Throw a 403 error with the given message.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    throw403(message) {
        throw error_403(message);
    },
    /// #### common.api.error404([message])
    /// Create a 404 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    ///
    /// **Returns:**
    /// - `Promise`.
    error404(message) {
        return Promise.reject(error_404(message));
    },
    /// #### common.api.throw404([message])
    /// Throw a 404 error with the given message.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    throw404(message) {
        throw error_404(message);
    },
    /// #### common.api.error500([message])
    /// Create a 500 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    ///
    /// **Returns:**
    /// - `Promise`.
    error500(err) {
        return Promise.reject(error_500(err));
    },
    /// #### common.api.throw500([message])
    /// Throw a 500 error with the given message.
    ///
    /// **Parameters:**
    /// - `message`, the error message. _optional_.
    throw500(err) {
        throw error_500(err);
    },
    /// #### common.api.value(v)
    /// If the given value is a function return the value of the invocation,
    /// otherwise return the given value.
    ///
    /// **Parameters:**
    /// - `value`, a value or a function.
    ///
    /// **Returns:**
    /// - `value` or `value()`.
    value: value,
    /// #### common.api.exist(value)
    /// Returns a promise fulfilled or rejected if given value is defined or
    /// not.
    ///
    /// **Parameters:**
    /// - `value`, the value to be checked.
    ///
    /// **Returns:**
    /// - `Promise`.
    exist(v) {
        /*eslint-disable eqeqeq*/
        if (v == undefined) { // true if v is null or undefined
            return Promise.reject(error_404());
        }
        /*eslint-enable eqeqeq*/
        return Promise.resolve(v);
    },
    /// #### common.api.valueChecker(fallback)
    /// Returns a function that check a value and returns it if it exists or
    /// a fallback value if not.
    ///
    /// **Parameters:**
    /// - `fallback`, a value to be returned if the checked value is not
    /// defined. If `fallback` is a `Function`, return value of `fallback()`.
    ///
    /// **Returns:**
    /// - `Promise`.
    valueChecker(fallback) {
        const fallback_value = value(fallback);
        return function(v) {
            /*eslint-disable eqeqeq*/
            if (v == undefined) { // true if v is null or undefined
                return Promise.resolve(fallback_value);
            }
            /*eslint-enabled eqeqeq*/
            return Promise.resolve(v);
        };
    },
    /// #### common.api.isAuthorized(res)
    /// Returns true if and only if the current request has been marked as
    /// authenticated.
    ///
    /// **Parameters:**
    /// - `res`, ...
    ///
    /// **Returns:**
    /// - `Boolean`.
    isAuthenticated: is_authenticated,
    /// #### common.api.authenticated(message)
    /// Returns a middleware function aimed to check if a request if
    /// authenticated or not. If the request is authenticated then the normal
    /// execution flow continues, otherwise the request is interrupted with 401
    /// error status and specified message.
    ///
    /// **Parameters:**
    /// - `message`, an optional message for the 401 error.
    ///
    /// **Returns:**
    /// - `Function(req, res, next)`
    authenticationChecker(message) {
        return function(req, res, next) {
            next(is_authenticated(res) ? null : error_401(message));
        };
    },
    /// #### common.api.forbidden(message)
    /// Returns a middleware function aimed at terminate a request with a 403
    /// error status and the specified message.
    ///
    /// **Parameters:**
    /// - `message`, an optional message for the 403 error.
    ///
    /// **Returns:**
    /// - `Function(req, res, next)`
    forbidden(message) {
        return function(req, res, next) {
            next(error_403(message));
        };
    },
    /// #### common.api.notFound(message)
    /// Returns a middleware function aimed at terminate a request with a 404
    /// error status and the specified message.
    ///
    /// **Parameters:**
    /// - `message`, an optional message for the 403 error.
    ///
    /// **Returns:**
    /// - `Function(req, res, next)`
    notFound(message) {
        return function(req, res, next) {
            next(error_404(message));
        };
    }
};
