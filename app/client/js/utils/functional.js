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
