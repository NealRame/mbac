/// utils/ui.js
/// -----------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:40:07 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');

    /// #### ui.pushDown(source, target, offset)
    /// Position the given source element in the bottom of the target element.
    ///
    /// __Parameters__:
    /// - `source`, a jquery element or a dom object.
    /// - `target`, a jquery element or a dom object.
    /// - `offset`, _optional_, default value is 0.
    function push_down(source, target, offset) {
        offset = offset || 0;
        source.css('margin-top', 0);
        source.css(
            'margin-top',
            Math.max(
                $(target).height() - $(source).position().top - $(source).height() + offset,
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
    /// __Return:__
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
    /// __Return:__
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
    /// __Return:__
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
    /// __Return:__
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
    /// __Return:__
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
    /// __Return:__
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
    /// __Return:__
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

    /// #### ui.outerRect(element)
    /// Return the outer rect of the given element.
    /// __Parameters:__
    /// - `element`, a dom or jquery object.
    ///
    /// __Return:__
    /// - An object with `width` and `height` attributes.
    function outer_rect(element) {
        try {
            var dom_elt = $(element).get(0);
            return {
                height: dom_elt ? $(dom_elt).outerHeight(true) : 0,
                width:  dom_elt ? $(dom_elt).outerWidth(true) : 0
            };
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
    /// __Return:__
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
        outerRect: outer_rect,
        rect: rect,
        scale: scale,
        pushDown: push_down,
    };
});
