// Thumbnail/thumbnail.js
// ----------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 18 21:45:35 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');

    var AchievementThumbnailView = require('common/Thumbnail/achievement-thumbnail');
    var FileThumbnailView = require('common/Thumbnail/file-thumbnail');
    var PictureThumbnailView = require('common/Thumbnail/picture-thumbnail');

    function cat() {
        var head = _.first(arguments);
        if (! _.isUndefined(head)) {
            return head.concat.apply(head, _.rest(arguments));
        }
        return [];
    };

    function construct(head, tail) {
        return cat([head], _.toArray(tail));
    };

    function dispatch() {
        var funs = _.toArray(arguments);
        var size = funs.length;

        return function(model) {
            var args = _.rest(arguments);

            for (var index = 0; index < size; index++) {
                var fun = funs[index];
                var ret = fun.apply(fun, construct(model, args));

                if (! _.isUndefined(ret)) {
                    return ret;
                }
            }
        }
    };

    function hasKeys(model) {
        var keys = _.rest(arguments);
        return _.every(keys, function(key) {
            return _.has(model.attributes, key);
        });
    };

    function isa(view) {
        var keys = _.rest(arguments);
        return function(model) {
            if (hasKeys.apply(null, construct(model, keys))) {
                return view;
            }
        };
    };

    return {
        Achievement: AchievementThumbnailView,
        File: FileThumbnailView,
        Picture: PictureThumbnailView,
        create: dispatch(
            isa(AchievementThumbnailView, 'pictures'),
            isa(FileThumbnailView, 'file'),
            isa(PictureThumbnailView, 'original', 'thumbnail')
        ),
    };

});
