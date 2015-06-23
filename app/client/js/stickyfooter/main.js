define(function(require) {
    'use strict';

    require('foundation');

    var _ = require('underscore');
    var $ = require('jquery');
    var ui = require('common/ui');

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    $(function() {
        var footer = $('body > footer').first();
        var push_footer_down = _.debounce(ui.pushDown.bind(null, footer, window, 0), 100);
        $(document).foundation();
        $(window)
            .bind('load', push_footer_down)
            .bind('resize', push_footer_down);
        push_footer_down();

        if (MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                _.each(mutations, function() {
                    push_footer_down();
                });
            });

            observer.observe(document, {
                childList: true,
                subtree: true
            });
        }
    });
});
