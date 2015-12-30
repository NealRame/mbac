/// Flag mixin.
/// ===========
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Dec 30 01:53:50 CET 2015
define(function() {
    'use strict';

    var _ = require('underscore');
    var functional = require('common/functional');
    var util = require('common/util');

    return function(flag, default_value) {
        return _.assign(
            functional.existy(default_value)
                ? {defaults: _.object([[flag, default_value]])}
                : {},
            _.object([
                [
                    flag,
                    function() {
                        return this.get(flag);
                    }
                ],
                [
                    'set' + util.upperFirst(flag),
                    function(enabled) {
                        return this.set(flag, enabled);
                    }
                ],
                [
                    'toggle' + util.upperFirst(flag),
                    function() {
                        return this.set(flag, !this.get(flag));
                    }
                ]
            ])
        );
    };
});
