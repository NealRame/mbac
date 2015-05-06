// helpers.js
// ==========
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Apr  3 01:40:23 2015
var _ = require('underscore');

function error(err, status) {
    if (_.isString(err)) {
        err = new Error(err);
    }
    err.status = status;
    return err;
}

function error_401(message) {
    if (_.isUndefined(message) || ! _.isString(message)) {
        message = 'Unauthorized';
    }
    return error(message, 401);
}

function error_403(message) {
    if (_.isUndefined(message) || ! _.isString(message)) {
        message = 'Forbidden';
    }
    return error(message, 403);
}

function error_404(message) {
    if (_.isUndefined(message) || ! _.isString(message)) {
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
    return res.locals.loggedIn;
}

function value(value) {
    return _.result({value: value}, 'value');
}

module.exports = {
    /// #### helpers.error401([message])
    /// Create a 401 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    ///
    /// __Returns:__
    /// - `Promise`.
    error401: function(message) {
        return Promise.reject(error_401(message));
    },
    /// #### helpers.throw401([message])
    /// Throw a 401 error with the given message.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    throw401: function(message) {
        throw error_401(message);
    },
    /// #### helpers.error403([message])
    /// Create a 403 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    ///
    /// __Returns:__
    /// - `Promise`.
    error403: function(message) {
        return Promise.reject(error_403(message));
    },
    /// #### helpers.throw403([message])
    /// Throw a 403 error with the given message.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    throw403: function(message) {
        throw error_403(message);
    },
    /// #### helpers.error404([message])
    /// Create a 404 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    ///
    /// __Returns:__
    /// - `Promise`.
    error404: function(message) {
        return Promise.reject(error_404(message));
    },
    /// #### helpers.throw404([message])
    /// Throw a 404 error with the given message.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    throw404: function(message) {
        throw error_404(message);
    },
    /// #### helpers.error500([message])
    /// Create a 500 error with the given message. The error is returned as a
    /// rejected promise and so can be used in a chain of promise.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    ///
    /// __Returns:__
    /// - `Promise`.
    error500: function(err) {
        return Promise.reject(error_500(err));
    },
    /// #### helpers.throw500([message])
    /// Throw a 500 error with the given message.
    ///
    /// __Parameters:__
    /// - `message`, the error message. _optional_.
    throw500: function(err) {
        throw error_500(err);
    },
    /// #### helpers.value(v)
    /// If the given value is a function return the value of the invocation,
    /// otherwise return the given value.
    ///
    /// __Parameters:__
    /// - `value`, a value or a function.
    ///
    /// __Returns:__
    /// - `value` or `value()`.
    value: value,
    /// #### helpers.checkValue(value)
    /// Returns a promise fulfilled or rejected if given value is defined or
    /// not.
    ///
    /// __Parameters:__
    /// - `value`, the value to be checked.
    ///
    /// __Returns:__
    /// - `Promise`.
    valueChecker: function(fallback) {
        var fallback_value = value(fallback);
        return function(value)  {
            if (value == undefined) {
                return fallback_value;
            }
            return Promise.resolve(value);
        };
    },
    /// #### helpers.isAuthorized(res)
    /// Returns true if and only if the current request has been marked as
    /// authenticated.
    ///
    /// __Parameters:__
    /// - `res`, ...
    ///
    /// __Returns:__
    /// - `Boolean`.
    isAuthenticated: is_authenticated,
    /// #### helpers.authenticated(message)
    /// Returns a middleware function aimed to check if a request if
    /// authenticated or not. If the request is authenticated then the normal
    /// execution flow continues, otherwise the request is interrupted with 401
    /// error status and specified message.
    ///
    /// __Parameters:__
    /// - `message`, an optional message for the 401 error.
    ///
    /// __Returns:__
    /// - `Function(req, res, next)`
    authenticationChecker: function(message) {
        return function(req, res, next) {
            next(is_authenticated(res) ? null : error_401(message));
        };
    },
    /// #### helpers.forbidden(message)
    /// Returns a middleware function aimed at terminate a request with a 403
    /// error status and the specified message.
    ///
    /// _Parameters:__
    /// - `message`, an optional message for the 403 error.
    forbidden: function(message) {
        return function(req, res, next) {
            next(error_403(message));
        };
    },
    /// #### helpers.notFound(message)
    /// Returns a middleware function aimed at terminate a request with a 404
    /// error status and the specified message.
    ///
    /// _Parameters:__
    /// - `message`, an optional message for the 403 error.
    notFound: function(message) {
        return function(req, res, next) {
            next(error_404(message));
        };
    },
};
