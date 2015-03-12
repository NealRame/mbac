// Thumbnail/thumbnail.js
// ----------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Feb 18 21:45:35 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');

    var functional = require('utils/functional');
    var AchievementThumbnailView = require('common/Thumbnail/achievement-thumbnail');
    var FileThumbnailView = require('common/Thumbnail/file-thumbnail');
    var GenericThumbnailView = require('common/Thumbnail/base-thumbnail');
    var PictureThumbnailView = require('common/Thumbnail/picture-thumbnail');

    function hasKeys(model) {
        var keys = _.rest(arguments);
        return _.every(keys, function(key) {
            return _.has(model.attributes, key);
        });
    }

    function isa(view) {
        var keys = _.rest(arguments);
        return function(model) {
            if (hasKeys.apply(null, functional.construct(model, keys))) {
                return view;
            }
        };
    }

    return {
        Achievement: AchievementThumbnailView,
        File: FileThumbnailView,
        Picture: PictureThumbnailView,
        create: functional.dispatch(
            isa(AchievementThumbnailView, 'pictures'),
            isa(FileThumbnailView, 'file'),
            isa(PictureThumbnailView, 'original', 'thumbnail'),
            _.identity.bind(null, GenericThumbnailView) // fallback
        ),
    };

});
