define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var async = require('common/async');
    var ui = require('common/ui');

    function map_object(o, iteratee) {
        return _.object(_.map(o, function(val, key) {
            return [key, iteratee(val, key)];
        }));
    }

    $('#achievements > li.thumb .crop').each(function() {
        var figure = $(this);
        var uri = figure.data('uri');
        figure.height(Math.round(2*figure.width()/3));
        async.loadImage(uri)
            .then(function(image) {
                var fig_rect = map_object(ui.naturalRect(figure), function(v) {
                    return v - 8;
                });
                figure.append($(image).css(
                    ui.center(ui.cropFit(ui.naturalRect(image), fig_rect), fig_rect)
                ));
            });
    });
});
