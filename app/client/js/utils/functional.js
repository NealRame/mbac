// utils/functional.js
// -------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Mar 12 03:49:48 2015
define(function(require) {
	var _ = require('underscore');

	function cat() {
		var head = _.first(arguments);
		if (!_.isUndefined(head)) {
			return head.concat.apply(head, _.rest(arguments));
		}
		return [];
	}

	function construct(head, tail) {
		return cat([head], _.toArray(tail));
	}

	/// #### functional.hasAllOfAttributes(model, *keys)
	/// Returns true if and only if the given model has all the given
	/// attributes.
	///
	/// __Parameters:__
	/// - `model`, a backbone model.
	/// - `keys`, strings.
	///
	/// __Returns:__
	/// - `Boolean`.
	function hasAllOfAttributes(model) {
        var keys = _.rest(arguments);
        return _.every(keys, function(key) {
            return _.has(model.attributes, key);
        });
    }

	function dispatch() {
		var funs = _.toArray(arguments);
		var size = funs.length;

		return function(target) {
			var args = _.rest(arguments);

			for (var index = 0; index < size; index++) {
				var fun = funs[index];
				var ret = fun.apply(fun, construct(target, args));

				if (!_.isUndefined(ret)) {
					return ret;
				}
			}
		};
	}

    return {
        cat: cat,
        construct: construct,
        dispatch: dispatch
    };
});
