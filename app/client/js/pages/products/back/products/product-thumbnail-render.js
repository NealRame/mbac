/// Product render function.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Dec 26 22:45:50 CET 2015
define(function(require) {
    'use strict';

    var Promise = require('promise');
    var functional = require('common/functional');
    var render_file = require('common/Thumbnail/file-render');
    var render_picture = require('common/Thumbnail/picture-render');

    var render = functional.dispatch(
        render_file,
        render_picture,
        function() {
            return Promise.resolve({
                el: null
            });
        }
    );

    return function(model) {
        if (functional.hasAllOfAttributes(model, 'pictures')) {
            return render.call(this, model.picture())
                .then(function(thumb) {
                    thumb.target = model.editURL();
                    return thumb;
                });
        }
    };
});
