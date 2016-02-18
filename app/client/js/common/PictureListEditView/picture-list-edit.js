// PictureListEditView.
// ====================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Feb 18 22:46:24 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var PictureList = require('PictureList');
    var util = require('common/util');
    var template = require('text!common/PictureListEditView/picture-list-edit.html');

    return Marionette.LayoutView.extend({
        className: 'row',
        childEvents: {
            'picture:added': 'onPicturesChanged',
            'picture:removed': 'onPicturesChanged'
        },
        template: _.template(template),
        initialize: function(options) {
            this.mergeOptions(options, ['inputAttribute', 'inputId', 'inputLabel']);
            this.pictures = new Backbone.Collection();
            if (!this.inputId) {
                this.inputId = util.randomString({
                    prefix: 'input'
                });
            }
        },
        serializeData: function() {
            return {
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onRender: function() {
            this.addRegion('pictures', {
                el: this.$('#' + this.inputId)
            });
            this.showChildView('pictures', new PictureList({
                collection: this.pictures,
                editable: true,
                thumbnailsRect: {
                    width: 192,
                    height: 128
                }
            }));
        },
        onPicturesChanged: function() {
            this.triggerMethod('change', this.value());
        },
        value: function() {
            return _.object([
                [
                    this.inputAttribute,
                    this.pictures.map(function(picture) {
                        return picture.attributes;
                    })
                ]
            ]);
        },
        setValue: function(pictures) {
            this.pictures.add(pictures);
        }
    });
});
