/* global File: false */

/// PictureList.
/// ============
///
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Dec 28 11:24:18 CET 2015
///
/// Editable list of pictures.
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var ThumbnailList = require('ThumbnailList');

    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }

    return ThumbnailList.extend({
        thumbnailOptions: {
            removable: true,
            clickBehavior: 'none',
            rect: {
                height: 128,
                width: 192
            }
        },
        childEvents: {
            'remove': 'onPictureRemoved'
        },
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
            ThumbnailList.prototype.initialize.call(this);
            this.listenTo(this.collection, 'remove', function(model, col, opt) {
                this.trigger('remove-picture', model.attributes, opt.index);
            });
        },
        addFile: function(file) {
            if (file instanceof File) {
                var picture = {file: file};
                var index = this.collection.length;
                this.collection.add(picture);
                this.trigger('add-picture', picture, index);
            }
        },
        addFiles: function(files) {
            _.each(files, this.addFile, this);
        },
        center: function() {
            this.$el.removeAttr('style');
            if (this.children.length > 0) {
                var th_width = this.children.first().outerRect().width;
                this.$el.css('width', th_width*Math.floor(this.$el.width()/th_width));
            }
        },
        onDragEnter: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.attr('data-state', 'over');
            return false;
        },
        onDragLeave: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.removeAttr('data-state');
            return false;
        },
        onDragOver: function(e) {
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        onDrop: function(e) {
            this.onDragLeave.call(this, e);
            this.addFiles(e.dataTransfer.files);
            return false;
        },
        onPictureRemoved: function(view, model) {
            this.collection.remove(model);
        }
    });
});
