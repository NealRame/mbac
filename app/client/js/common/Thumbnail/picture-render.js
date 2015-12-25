/// Picture renderer
/// ================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
	'use strict';

	var $ = require('jquery');
	var Promise = require('promise');
    var async = require('common/async');
	var functional = require('common/functional');
	var ui = require('common/ui');

	function load_image(url) {
		if (this.$image && this.$image.attr('src') === url) {
			return Promise.resolve(this.$image);
		}
		return async.loadImage(url);
	}

	return function(model) {
		if (functional.hasAllOfAttributes(model, 'original', 'thumbnail')) {
			var image_source = model.thumbnailURL();
			return load_image.call(this, image_source)
				.bind(this)
				.then(function(image) {
					var rect = this.innerRect();
					this.$image = $(image);
					this.$image.removeAttr('style');
					this.$image.css(ui.center(ui.cropFit(ui.naturalRect(this.$image), rect), rect));
					return {
						el: this.$image,
						target: model.originalURL()
					};
				})
				.catch(function() {
					throw new Error('Failed to load image: ' + image_source);
				});
		}
	};
});
