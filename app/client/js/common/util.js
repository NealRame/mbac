/// common/util.js
/// --------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed May 20 20:59:53 CEST 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');

    var mail_regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    /// common.util.checkMailAddress(address)
    /// Returns true if and only if address is a valid mail address.
    ///
    /// **Parameters:**
    /// - `address` a `String`.
    ///
    /// **Return:**
    /// - `Boolean`.
    function check_mail_address(address) {
        return mail_regex.test(address);
    }

    /// common.util.makeFormValidator(funs...)
    /// Creates and return a function which will call the given functions to
    /// the form passed to the returned function.
    ///
    /// **Parameters:**
    /// - `funs`...: some `Function`
    ///
    /// **Return:**
    /// - `Function`
    ///
    /// The return functions signature is `validator(form[, options])` with:
    /// - `form`, the jquery form object to validate,
    /// - `options`, a hash object with eventually the following attributes:
    ///   - `clearError`, a `Function`,
    ///   - `setError`, a `Function`
    /// The given functions must have the given signature:
    /// `validate(form[, options])`, with:
    /// - `form`, the jquery form object to validate,
    /// - `options`, the hash object passed to the returned function.
    function make_form_validator(options) {
        var args;
        if (_.isObject(options)) {
            args = _.rest(arguments);
        } else {
            args = _.toArray(arguments);
            options = {};
        }
        options = _.defaults(options, {clearError: _.noop, setError: _.noop});
        return function(form) {
            return _.reduce(args, function(memo, validate) {
                var value = validate(form, options.clearError, options.setError);
                if (value && memo) {
                    return _.extend(memo, value);
                }
            }, {});
        };
    }

    return {
        checkMailAddress: check_mail_address,
        makeFormValidator: make_form_validator
    };
});
