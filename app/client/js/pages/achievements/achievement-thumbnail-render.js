// Thumbnail/achievement-thumbnail.js
// ----------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 23:06:45 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;
    var Promise = require('promise');

    var async = require('utils/async');
    var functional = require('utils/functional');
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
                    thumb.target = model.pageURL();
                    return thumb;
                });
        }
    };
});
