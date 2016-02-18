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

    /// #### common.util.upperFirst(string)
    /// Transform the string so the first character will be capitalized.
    ///
    /// **Parameters:**
    /// - `string`, a `String`.
    ///
    /// **Return:**
    /// - `String`.
    function upper_first(string) {
        if (string.length > 0) {
            return string[0].toUpperCase() + string.substr(1);
        }
        return string;
    }

    /// #### common.util.randomString(options)
    /// Generation random string and return it.
    ///
    /// **Parameters:**
    /// - `options`, an `Object` to configure the string generation. Possible
    ///   attributes are:
    ///   - `length`, default value is `6`,
    ///   - `prefix`, default value is `''`,
    ///   - `alphabet`, default value is `'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'`
    ///
    /// **Return:**
    /// - `String`.
    function random_string(options) {
        options = _.defaults(options || {}, {
            length: 6,
            prefix: '',
            alphabet: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        });
        return (
            (options.prefix ? options.prefix + '-' : '')
            + _.chain(_.times(options.length, _.random.bind(null, options.alphabet.length - 1)))
                .map(function(index) { return options.alphabet[index]; })
                .value()
                .join('')
        );
    }

    return {
        checkMailAddress: check_mail_address,
        makeFormValidator: make_form_validator,
        upperFirst: upper_first,
        randomString: random_string
    };
});
