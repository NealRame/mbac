// Thumbnail/thumbnail.js
// ----------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Mar 10 21:55:49 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;
    var Promise = require('promise');

    var functional = require('utils/functional');
    var ui = require('utils/ui');
    var thumbnailTemplate = require('text!common/Thumbnail/thumbnail.html');

    var achievement_render = require('common/Thumbnail/achievement-render');
    var file_render = require('common/Thumbnail/file-render');
    var picture_render = require('common/Thumbnail/picture-render');

    var thumb_render = functional.dispatch(
        achievement_render,
        file_render,
        picture_render,
        function() {
            return Promise.resolve({
                el: this.placeholder('unknown'),
                target: ''
            });
        }
    );

    return Marionette.ItemView.extend({
        className: 'thumb',
        ui: {
            actions: '.action-bar > a',
            crop: '.crop',
            thumbLink: '.thumb-link',
        },
        events: {
            'click @ui.actions': 'onActionRequested',
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave',
        },
        triggers: {
            'click @ui.thumbLink': 'click',
        },
        editable: false,
        removable: false,
        initialize: function() {
            if (!_.isUndefined(this.model)) {
                this.listenTo(this.model, 'change', this.render);
            }
        },
        serializedData: function() {
            return {};
        },
        template: _.template(thumbnailTemplate),
        templateHelpers: function() {
            var data = {
                height: Marionette.getOption(this, 'height'),
                width:  Marionette.getOption(this, 'width'),
                actions: []
            };

            if (Marionette.getOption(this, 'removable')) {
                data.actions.push({
                    name: 'remove',
                    icon: 'fa fa-trash'
                });
            }
            if (Marionette.getOption(this, 'editable')) {
                data.actions.push({
                    name: 'edit',
                    icon: 'fa fa-pencil'
                });
            }
            return data;
        },
        thumbnailInnerRect: function() {
            return ui.rect(this.ui.crop);
        },
        thumbnailOuterRect: function() {
            return ui.outerRect(this.el);
        },
        placeholder: function(type, ratio) {
            ratio = ratio || 1;

            var classes = {
                spinner: 'fa fa-circle-o-notch fa-spin',
                empty: 'fa fa-ban fa-fw',
                error: 'fa fa-exclamation-circle fa-fw',
                unknown: 'fa fa-question-circle'
            };
            var rect = this.thumbnailInnerRect();
            var font_size = (Math.min(rect.width, rect.height) - 32)*ratio;

            return $(document.createElement('i'))
                .addClass([classes[type] || 'fa fa-question-circle', type].join(' '))
                .css({
                    fontSize: font_size,
                    height: font_size,
                    left: (rect.width - font_size)/2,
                    top: (rect.height - font_size)/2,
                    width: font_size,
                });
        },
        target: function() {
            return this.ui.thumbLink.attr('href');
        },
        onActionRequested: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger($(e.currentTarget).attr('data-action'), this.model);
            return false;
        },
        onMouseEnter: function(e) {
            this.$('.action-bar').fadeIn(100);
            return false;
        },
        onMouseLeave: function(e) {
            this.$('.action-bar').fadeOut(100);
            return false;
        },
        onShow: function() {
            this.ui.thumbLink.empty().append(this.placeholder('spinner'));
            thumb_render.call(this, this.model)
                .bind(this)
                .then(function(thumbnail) {
                    this.ui.thumbLink
                        .empty()
                        .append(thumbnail.el || this.placeholder('empty'))
                        .attr('href', thumbnail.target);
                    this.trigger('ready');
                })
                .catch(function() {
                    this.ui.thumbLink.empty().append(this.placeholder('error'));
                });
        }
    });
});
