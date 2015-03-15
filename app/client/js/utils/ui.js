/// utils/ui.js
/// -----------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:40:07 2015
define(function(require) {
    var _ = require('underscore');
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

    /// #### ui.center(source, target)
    /// Center the source rectangle around or into the target rectangle.
    ///
    /// __Parameters:__
    ///   - `source`, the source rectangle,
    ///   - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function center(source, target) {
        try {
            return _.extend(
                source,
                {
                    left: (target.width  - source.width)/2,
                    top:  (target.height - source.height)/2,
                }
            );
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.cropFit(source, target)
    /// Fit the source rectangle given to the size of a target rectangle. The
    /// cropFit scale the source such as its smallest side fits the target's
    /// corresponding side.
    ///
    /// __Parameters:__
    ///   - `source`, the source rectangle,
    ///   - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function crop_fit(source, target) {
        try {
            var source_fitness = source.width/source.height;
            var target_fitness = target.width/target.height;
            var scale_ratio =
                    source_fitness > target_fitness
                        ? target.height/source.height
                        : target.width/source.width;

            return {
                height: source.height*scale_ratio,
                width: source.width*scale_ratio,
            };
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.fit(source, target)
    /// Fit the source rectangle given to the size of a target rectangle. The
    /// aspect of the source rectangle is preserved, i.e. the ratio between
    /// the resulted width and height is constant.
    ///
    /// __Parameters:__
    ///   - `source`, the source rectangle,
    ///   - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function fit(source, target) {
        try {
            var source_fitness = source.width/source.height;
            var target_fitness = target.width/target.height;
            var scale_ratio =
                    source_fitness > target_fitness
                        ? target.width/source.width
                        : target.height/source.height;

            return {
                height: source.height*scale_ratio,
                width: source.width*scale_ratio,
            };
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.imageRect(image)
    /// Return the size of the given image.
    ///
    /// __Parameters:__
    ///   - `image`, a dom or jquery object corresponding to an image.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function image_size(image) {
        try {
            var img = $(image).get(0);
            return {
                height: img ? img.naturalHeight : 0,
                width:  img ? img.naturalWidth  : 0,
            };
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    return {
        center: center,
        cropFit: crop_fit,
        fit: fit,
        imageSize: image_size,
        stickyFooter: sticky_footer,
    };
});
