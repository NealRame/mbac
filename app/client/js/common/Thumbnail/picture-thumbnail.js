// Thumbnail/picture-thumbnail.js
// ------------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:57:55 2015
define(function(require) {
	var _ = require('underscore');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var Marionette = Backbone.Marionette;

    var async = require('utils/async');
	var GenericThumbnailView = require('common/Thumbnail/generic-thumbnail');

	return GenericThumbnailView.extend({
		renderThumbnail: function() {
			return async.loadImage(this.model.thumbnailURL())
				.bind(this)
				.then(function(image) {
					$(image).css(this.geometry(image));
					return {
						el: image,
						target: this.model.originalURL()
					};
				})
				.catch(function() {
					throw new Error('Failed to load image: ' + source);
				});
		}
	});
});
