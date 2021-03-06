/* eslint-disable strict, no-var */

/// Async helpers
/// -------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun May  3 11:08:51 CEST 2015
///
/// Provides common function to deal with asynchronous operations.

var _ = require('underscore');

/// #### common.async.make_callback(resolve, reject)
/// Make a nodejs style callback, wrapping the two given function. If callback
/// is called with its first argument defined then the `reject` function is
/// called with that arguments, otherwise the `resolve` is called with the rest
/// of arguments in an `Array` if there are more than one argument.
///
/// **Parameters:**
/// - `resolve`, `Function`.
/// - `reject`, `Function`.
/// **Return:**
/// - `Function`
function make_callback(resolve, reject) {
    return function(err) {
        if (err) {
            reject(err);
        } else {
            var args = _.rest(arguments);
            resolve.apply(null, args.length > 1 ? [args] : args);
        }
    };
}
exports.make_callback = make_callback;

/// #### common.async.make_promise(fun[, ...args])
/// Wrap the given asynchronous function and returns a promise.
///
/// The given function signature has to be of the form:
/// ```fun(...args, callback)```
///
/// The callback signature of the given function must be a node style
/// completion callback.
///
/// **Parameters:**
/// - `fun`, an asynchronous function.
/// The rest of the arguments are forwarded to the given function.
///
/// **Return:**
/// - `Promise`.
function make_promise(fun) {
    var args = _.rest(arguments);
    return new Promise(function(resolve, reject) {
        fun.apply(null, args.concat(make_callback(resolve, reject)));
    });
}
exports.make_promise = make_promise;

/// #### common.async.nodify(promise[, callback])
/// If a callback function is passed as second argument, then it is called when
/// the given promise is fulfilled or rejected, otherwise simply return the
/// given promise.
///
/// **Parameters:**
/// - `promise`, `Promise`.
/// - `callback`, a nodejs style callback.
///
/// **Return:**
/// - `undefined` or `Promise`
function nodify(promise, callback) {
    if (callback) {
        promise.then(
            function() {
                callback.apply(null, [null].concat(_.toArray(arguments)));
            },
            function(err) {
                callback.call(null, err);
            }
        );
    } else return promise;
}
exports.nodify = nodify;

/// #### common.async.promisify(fun[, self])
/// Wrap the given asynchronous function/method to make a function returning
/// a `Promise`.
///
/// The given function signature has to be of the form:
/// ```fun(...args, callback)```
///
/// **Parameters:**
/// - `fun`, an asynchronous function.
///
/// **Return:**
/// - `Function` returning a `Promise`.
function promisify(fun, self) {
    return function() {
        return make_promise(fun.bind(self), _.toArray(arguments));
    };
}
exports.promisify = promisify;
