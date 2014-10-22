define(function(require) {
    var $ = require('jquery');
    var Foundation = require('foundation');
    var stickyFooter = require('app/sticky-footer');

    $(document).foundation();
    $(window)
        .bind('load', stickyFooter.bind(null, 0))
        .bind('resize', Foundation.utils.throttle(stickyFooter.bind(null, 0), 150));
    stickyFooter(0);
});
