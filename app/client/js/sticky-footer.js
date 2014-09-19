define(['jquery', 'foundation.core'], function($) {
    var footer = $('body > footer').first();
    return function(offset) {
        footer.css(
            'margin-top',
            Math.max(
                $(this).height() - footer.position().top - footer.height() + offset,
                0
            )
        );
    };
});
