define(function(require) {
    var $ = require('jquery');
    var footer = $('body > footer').first();

    function stick(offset) {
        footer.css(
            'margin-top',
            Math.max(
                $(this).height() - footer.position().top - footer.height() + offset,
                0
            )
        );
    }

    $(document).foundation();
    $(window)
        .bind('load', stick.bind(null, 0))
        .bind('resize', Foundation.utils.throttle(stick.bind(null, 0), 150));
    stick(0);
});
