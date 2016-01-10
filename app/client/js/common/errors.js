/// Errors.
/// =======
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 19:12:28 CET 2015
define(function(require) {
    'use strict';

    function ModelValidationError(reason, msg) {
        this.stack = (new Error).stack;
        this.message = msg;
        this.reason = reason || {};
    }
    ModelValidationError.prototype = Object.create(Error.prototype);
    ModelValidationError.prototype.name = 'ModelValidationError';

    return {
        ModelValidationError: ModelValidationError
    };
});
