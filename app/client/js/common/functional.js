/// utils/functional.js
/// -------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:49:48 2015
define(function(require) {
	var _ = require('underscore');

	/// #### applyIf(pred, fun)
	/// Returns a function that takes an argument and apply the given function
	/// to this argument if and only if the predicate returns true for this
	/// argument. If the predicate returns false, then the returned function
	/// will return undefined.
	///
	/// __Parameters:__
	/// - `pred`, a predicat function.
	/// - `fun`, the function to be applied.
	///
	/// __Returns:__
	/// - `Function`
	function apply_if(pred, fun) {
        return function(target) {
            if (pred(target)) {
                return fun(target);
            }
        };
    }

	/// #### existy(value)
	/// Returns true if and only if the given value is neither null nor
	/// undefined.
	///
	/// __Parameters:__
	/// - `value`, whatever you want
	///
	/// __Returns:__
	/// - `Boolean`
	function existy(value) {
		return value != null;
	}

	/// #### functional.cat(*arrays)
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
	function has_all_of_keys(object) {
		var keys = _.rest(arguments);
		return _.isObject(object) && _.every(keys, function(key) {
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
	function has_all_of_attributes(model) {
		return _.isObject(model) && has_all_of_keys.apply(null, construct(model.attributes, _.rest(arguments)));
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
				var ret = fun.apply(this, construct(target, args));

				if (!_.isUndefined(ret)) {
					return ret;
				}
			}
		};
	}

	/// #### functional.mapObject(object, fun)
	/// Return an object wich each fields is the result of the call of the
	/// given function to the corresponding field of the given object.
	///
	/// __Parameters:__
	/// - `o`, an `Object`.
	/// - `fun`, a `Function`.
	///
	/// __Return:__
	/// - `Object`.
	function map_object(o, iteratee) {
        return _.object(_.map(o, function(val, key) {
            return [key, iteratee(val, key)];
        }));
    }

    return {
		applyIf: apply_if,
        cat: cat,
        construct: construct,
        dispatch: dispatch,
		existy: existy,
		hasAllOfKeys: has_all_of_keys,
		hasAllOfAttributes: has_all_of_attributes,
		mapObject: map_object
    };
});
