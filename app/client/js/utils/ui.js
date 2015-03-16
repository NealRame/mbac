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

    /// #### ui.hCenter(source, target)
    /// Horizontally center the source rectangle around or into the target
    /// rectangle.
    ///
    /// __Parameters:__
    /// - `source`, the source rectangle,
    /// - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `left` attribute.
    function h_center(source, target) {
        try {
            return _.extend(
                source,
                {
                    left: (target.width  - source.width)/2,
                }
            );
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.vCenter(source, target)
    /// Verticaly center the source rectangle around or into the target
    /// rectangle.
    ///
    /// __Parameters:__
    /// - `source`, the source rectangle,
    /// - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `top` attribute.
    function v_center(source, target) {
        try {
            return _.extend(
                source,
                {
                    top: (target.height - source.height)/2,
                }
            );
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.center(source, target)
    /// Center the source rectangle around or into the target rectangle.
    ///
    /// __Parameters:__
    /// - `source`, the source rectangle,
    /// - `target`, the target rectangle.
    /// Both `source` and `target` are objects with `width` and `height`
    /// attributes.
    ///
    /// __Returns:__
    /// - An object with `left` and `top` attributes.
    function center(source, target) {
        return _.extend(h_center(source, target), v_center(source, target));
    }

    /// #### ui.cropFit(source, target)
    /// Fit the source rectangle given to the size of a target rectangle. The
    /// cropFit scale the source such as its smallest side fits the target's
    /// corresponding side.
    ///
    /// __Parameters:__
    /// - `source`, the source rectangle,
    /// - `target`, the target rectangle.
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
    /// - `source`, the source rectangle,
    /// - `target`, the target rectangle.
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

    /// #### ui.scale(source, ratio)
    /// Scale the given rectangle by the given ratio.
    ///
    /// __Parameters:__
    /// - `source`, an object with `width` and `height` attributes,
    /// - `ratio`, the ratio use to scale the given rectangle.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function scale(source, ratio) {
        try {
            return {
                height: source.height*ratio,
                width: source.width*ratio,
            };
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.rect(element)
    /// Return the client rectangle of the given element.
    ///
    /// __Parameters:__
    /// - `element`, a dom or jquery object.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function rect(element) {
        try {
            var dom_elt = $(element).get(0);
            return (dom_elt && dom_elt.getBoundingClientRect
                ? _.pick(dom_elt.getBoundingClientRect(), 'height', 'width')
                : {
                    height: dom_elt ? dom_elt.innerHeight : 0,
                    width:  dom_elt ? dom_elt.innerWidth  : 0
                });
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    /// #### ui.naturalRect(element)
    /// Return the natural rectangle of the given element. If the given element
    /// is an image then it will return the rectangle of the un-resized image.
    ///
    /// __Parameters:__
    /// - `element`, a dom or jquery object.
    ///
    /// __Returns:__
    /// - An object with `width` and `height` attributes.
    function natural_rect(element) {
        try {
            var dom_elt = $(element).get(0);
            return (dom_elt && dom_elt.naturalWidth
                ? {
                    height: dom_elt.naturalHeight,
                    width:  dom_elt.naturalWidth
                }
                : rect(element));
        } catch (err) {
            throw new TypeError('Wrong types of parameters supplied');
        }
    }

    return {
        hCenter: h_center,
        vCenter: v_center,
        center: center,
        cropFit: crop_fit,
        fit: fit,
        naturalRect: natural_rect,
        rect: rect,
        scale: scale,
        stickyFooter: sticky_footer,
    };
});
