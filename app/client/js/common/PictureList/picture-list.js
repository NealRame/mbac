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
    var LightBox = require('LightBox');
    var ThumbnailList = require('ThumbnailList');

    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }

    return ThumbnailList.extend({
        childEvents: {
            'add-item-click': 'onAddItemClicked',
            'item-click': 'onItemClicked',
            'destroy': 'onItemDestroyed'
        },
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        thumbnailsClickBehavior: 'trigger',
        viewComparator: function (model1, model2) {
            if (_.isEqual(model1.attributes, {})) {
                return 1;
            }
            if (_.isEqual(model2.attributes, {})) {
                return -1;
            }
            return 0;
        },
        initialize: function(options) {
            ThumbnailList.prototype.initialize.call(this, options);
        },
        addFile: function(file) {
            if (file instanceof File) {
                var picture = {file: file};
                this.collection.add(picture);
                this.triggerMethod('picture:added', picture);
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
        onAddItemClicked: function() {
            var filesInput = $(document.createElement('input')).attr({
                accept: '.gif,.jpeg,.jpg,.png',
                multiple: '',
                type: 'file'
            });
            filesInput.one('change', (function(e) {
                this.addFiles(e.target.files);
            }).bind(this));
			filesInput.click();
		},
        onItemClicked: function(child) {
            LightBox.open(this.items(), child._index);
        },
        onDragEnter: function(e) {
            if (this.editable) {
                e.preventDefault();
                e.stopPropagation();
                this.$el.attr('data-state', 'over');
                return false;
            }
        },
        onDragLeave: function(e) {
            if (this.editable) {
                e.preventDefault();
                e.stopPropagation();
                this.$el.removeAttr('data-state');
                return false;
            }
        },
        onDragOver: function(e) {
            if (this.editable) {
                e.dataTransfer.dropEffect = 'copy';
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        },
        onDrop: function(e) {
            if (this.editable) {
                this.onDragLeave.call(this, e);
                this.addFiles(e.dataTransfer.files);
                return false;
            }
        },
        onItemDestroyed: function(item) {
            this.triggerMethod('picture:removed', item.model);
            return false;
        }
    });
});
