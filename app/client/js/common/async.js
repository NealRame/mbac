/// utils/async.js
/// --------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Wed Mar 12 03:58:30 2015
define(function(require) {
    var $ = require('jquery');
    var Promise = require('promise');

    /// #### async.loadFileAsDataURL(file)
    /// Load the file as data URL.
    ///
    /// __Parameters:__
    /// - `file`, a `File` instance.
    ///
    /// __Return:__
    /// - `Promise` of a `String`.
    function load_file_as_data_url(file) {
        return (new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = resolve;
            reader.onerror = reject;
            reader.readAsDataURL(file);
        })).then(function(ev) {
            return ev.target.result;
        });
    }

    /// #### async.loadImage(source)
    /// Load the file as data URL.
    ///
    /// __Parameters:__
    /// - `source`, a `String` URI or a `File` instance.
    ///
    /// __Return:__
    /// - `Promise` of a DOM element for an image.
    function load_image(source) {
        if (source instanceof File) {
            return load_file_as_data_url(source).then(load_image);
        } else {
            return (new Promise(function(resolve, reject) {
                var image = new Image();
                $(image)
                    .one('load', resolve)
                    .one('error', reject)
                    .attr('src', source);
            })).then(function(ev) {
                return ev.target;
            });
        }
    }

    return {
        loadFileAsDataURL: load_file_as_data_url,
        loadImage: load_image,
    };
});
