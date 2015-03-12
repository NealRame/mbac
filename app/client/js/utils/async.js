// utils/async.js
// --------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Mar 12 03:58:30 2015
define(function(require) {
    var $ = require('jquery');
    var Promise = require('promise');

    function load_image(source) {
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

    function load_data_url(file) {
        return (new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = resolve;
            reader.onerror = reject;
            reader.readAsDataURL(file);
        })).then(function(ev) {
            return ev.target.result;
        });
    }

    return {
        loadImage: load_image,
        loadDataURL: load_data_url
    };
});
