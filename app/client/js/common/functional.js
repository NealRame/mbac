/// common/functional.js
/// --------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:49:48 2015
define(function(require) {
	'use strict';

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
	/// __Return:__
	/// - `Function`.
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
	/// - `value`, whatever you want.
	///
	/// __Return:__
	/// - `Boolean`.
	function existy(value) {
		return value != null;
	}

	/// #### functional.cat(*arrays)
	/// Returns an array made of the concatenation of all the given array. If
	/// zero arguments are provided, it returns an empty array.
	///
	/// __Parameters:__
	/// - `arrays`, arrays.
	///
	/// __Return:__
	/// - `Array`.
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
	/// - `head`, whatever you want.
	/// - `tail`, an array.
	///
	/// __Return:__
	/// - `Array`.
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
	/// __Return:__
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
	/// __Return:__
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
	/// __Return:__
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

	/// #### functional.value_of(v, context)
	/// If `v` is a function returns the result of its invocation, otherwise
	/// simply returns `v`.
	///
	/// __Parameters:__
	/// - `v`, what ever you want.
	/// - `context`, an `Object` to which the possibly given function will be
	/// bind to.
	function value_of(v, context) {
		return _.isFunction(v) ? v.call(context) : v;
	}

	/// #### functional.property(obj, path)
	/// Return the value stored at the given path in the given object.
	///
	/// __Parameters:__
	/// - `obj`, an `Object`.
	/// - `path`, a `String` .
	///
	/// __Examples:__
	/// ```js
	/// var o = {foo: [{bar: {baz: 42}}, {}]}
	/// functional.property(obj, '[0].bar.baz')
	/// // return 42
	/// ```
	function property(obj, path) {
        if (_.isString(path)) {
            return property(obj, _.compact(path.replace(/\[(\w+)\]/g, '.$1').split('.')));
        }
        if (!existy(obj) || path.length === 0) {
            return obj;
        }
		return property(obj[_.first(path)], _.rest(path));
    }

    return {
		applyIf: apply_if,
        cat: cat,
        construct: construct,
        dispatch: dispatch,
		existy: existy,
		hasAllOfKeys: has_all_of_keys,
		hasAllOfAttributes: has_all_of_attributes,
		isa: isa,
		mapObject: map_object,
		valueOf: value_of,
		property: property
    };
});
