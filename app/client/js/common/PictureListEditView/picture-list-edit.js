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
    var functional = require('common/functional');
    var util = require('common/util');
    var template = require('text!common/PictureListEditView/picture-list-edit.html');

    return Marionette.LayoutView.extend({
        className: 'row',
        template: _.template(template),
        initialize: function(options) {
            this.mergeOptions(options, ['inputAttribute', 'inputError', 'inputId', 'inputLabel']);
            if (!functional.existy(this.inputId)) {
                this.inputId = util.randomString({
                    prefix: 'input'
                });
            }
            if (!functional.existy(this.collection)) {
                this.collection = new Backbone.Collection([]);
            }
            this.listenTo(this.collection, 'add remove', function() {
                this.triggerMethod('changed');
            });
        },
        serializeData: function() {
            return {
                inputError: this.inputError,
                inputId: this.inputId,
                inputLabel: this.inputLabel
            };
        },
        onRender: function() {
            this.addRegion('pictures-wrapper', {
                el: this.$('#' + this.inputId)
            });
        },
        onShow: function() {
            this.showChildView('pictures-wrapper', new PictureList({
                collection: this.collection,
                editable: true,
                thumbnailsRect: {
                    width: 192,
                    height: 128
                }
            }));
        },
        value: function() {
            return _.object([
                [
                    this.inputAttribute,
                    this.collection.map(function(picture) {
                        return picture.attributes;
                    })
                ]
            ]);
        },
        setValue: function(pictures) {
            this.collection.reset(pictures);
        }
    });
});
