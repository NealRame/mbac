// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
	var _ = require('underscore');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var Marionette = require('marionette');
	var Promise = require('promise');
    var async = require('common/async');
	var functional = require('common/functional');
	var ui = require('common/ui');

	function load_image(url) {
		if (this._$image && this._$image.attr('src') === url) {
			return Promise.resolve(this._$image);
		}
		return async.loadImage(url);
	}

	return function(model) {
		if (functional.hasAllOfAttributes(model, 'original', 'thumbnail')) {
			return load_image.call(this, model.thumbnailURL())
				.bind(this)
				.then(function(image) {
					var rect = this.innerRect();
					this._$image = $(image);
					this._$image.removeAttr('style');
					this._$image.css(ui.center(ui.cropFit(ui.naturalRect(this._$image), rect), rect));
						var res = {
						el: this._$image,
						target: model.originalURL()
					};
					return res;
				})
				.catch(function(err) {
					throw new Error('Failed to load image: ' + source);
				});
		}
	};
});
