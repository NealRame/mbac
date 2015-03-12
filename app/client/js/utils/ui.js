// utils/ui.js
// -----------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Mar 12 03:40:07 2015
define(function(require) {
    var $ = require('jquery');

    function sticky_footer(footer, offset) {
        footer.css(
            'margin-top',
            Math.max(
                $(this).height() - footer.position().top - footer.height() + offset,
                0
            )
        );
    }

    return {
        stickyFooter: sticky_footer
    };
});
