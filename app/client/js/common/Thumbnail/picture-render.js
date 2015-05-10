// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
	var _ = require('underscore');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var Marionette = Backbone.Marionette;

    var async = require('common/async');
	var functional = require('common/functional');
	var ui = require('common/ui');

	return function(model) {
		debugger;
		if (functional.hasAllOfAttributes(model, 'original', 'thumbnail')) {
			return async.loadImage(model.thumbnailURL())
				.bind(this)
				.then(function(image) {
					var rect = this.innerRect();
					$(image).css(ui.center(ui.cropFit(ui.naturalRect(image), rect), rect));
					return {
						el: image,
						target: model.originalURL()
					};
				})
				.catch(function() {
					throw new Error('Failed to load image: ' + source);
				});
		}
	};
});
