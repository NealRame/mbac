define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Foundation = require('foundation');
    var ui = require('common/ui');

    $(function() {
        var footer = $('body > footer').first();
        var push_footer_down = ui.pushDown.bind(null, footer, window, 0);
        $(document).foundation();
        $(window)
            .bind('load', push_footer_down)
            .bind('resize', Foundation.utils.throttle(push_footer_down, 150));
        push_footer_down();
    });
});
