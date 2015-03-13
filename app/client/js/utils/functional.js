/// utils/functional.js
/// -------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:49:48 2015
define(function(require) {
	var _ = require('underscore');

	/// ### functional.cat(*arrays)
	/// Returns an array made of the concatenation of all the given array. If
	/// zero arguments are provided, it returns an empty array.
	///
	/// __Parameters:__
	/// - `arrays`, arrays
	///
	/// __Returns:__
	/// - `Array`
	function cat() {
		var head = _.first(arguments);
		if (!_.isUndefined(head)) {
			return head.concat.apply(head, _.rest(arguments));
		}
		return [];
	}

	/// #### functional.construct(head, tail)
	/// Returns an array made of the given head element prepened to the given
	/// tail array.
	///
	/// __Parameters:__
	/// - `head`, whatever you want
	/// - `tail`, an array
	///
	/// __Returns:__
	/// - `Array`
	function construct(head, tail) {
		return cat([head], _.toArray(tail));
	}

	/// #### functional.hasAllOfKeys(object, *keys)
	/// Returns true if and only if the given object has all the given keys.
	///
	/// __Parameters:__
	/// - `object`, an object.
	/// - `keys`, strings.
	///
	/// __Returns:__
	/// - `Boolean`.
	function hasAllOfKeys(object) {
		var keys = _.rest(arguments);
		return _.every(keys, function(key) {
			return _.has(object, key);
		});
	}

	/// #### functional.hasAllOfAttributes(model, *attributes)
	/// Returns true if and only if the given model has all the given
	/// attributes.
	///
	/// __Parameters:__
	/// - `model`, a backbone model.
	/// - `attributes`, strings.
	///
	/// __Returns:__
	/// - `Boolean`.
	function hasAllOfAttributes(model) {
		return hasAllOfKeys(model.attributes, _.resst(arguments));
    }

	/// #### functional.dispatch(*functions)
	/// Returns a function taking one argument that will successively invokes
	/// the given functions on the given argument until one returns a value.
	///
	/// __Parameters:__
	/// - `functions`, functions.
	///
	/// __Returns:__
	/// - `Function`.
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
