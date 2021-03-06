/// Thumbnail/thumbnail.js
/// ----------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 10 21:55:49 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var Promise = require('promise');
    var functional = require('common/functional');
    var ui = require('common/ui');
    var thumbnailBehaviors = require('common/Thumbnail/behaviors');
    var thumbnailTemplate = require('text!common/Thumbnail/thumbnail.html');
    var file_render = require('common/Thumbnail/file-render');
    var picture_render = require('common/Thumbnail/picture-render');

    var renderers = [
        file_render,
        picture_render,
        function() {
            return this.placeholder('unknown-item');
        }
    ];

    function make_renderer(custom_renderers) {
        return functional.dispatch.apply(
            null, functional.cat(custom_renderers || [], renderers)
        );
    }

    return Marionette.ItemView.extend({
        className: 'thumb',
        ui: {
            crop: '.crop',
            removeLink: '.action-bar > a[data-action="remove"]',
            thumbLink: '.thumb-link'
        },
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        behaviors: {
            thumbLink: {
                behaviorClass: thumbnailBehaviors.click
            },
            removeLink: {
                behaviorClass: thumbnailBehaviors.remove
            }
        },
        editable: false,
        removable: false,
        rect: {
            height: 128,
            width: 192
        },
        serializedData: function() {
            return {};
        },
        template: _.template(thumbnailTemplate),
        templateHelpers: function() {
            var data = {
                actions: []
            };
            if (this.isRemovable()) {
                data.actions.push({
                    name: 'remove',
                    icon: 'fa fa-trash'
                });
            }
            return _.extend(data, this.innerRect());
        },
        isEditable: function() {
            return functional.valueOf(
                Marionette.getOption(this, 'editable'),
                this
            );
        },
        isRemovable: function() {
            return functional.valueOf(
                Marionette.getOption(this, 'removable'),
                this
            );
        },
        innerRect: function() {
            return functional.valueOf(
                Marionette.getOption(this, 'rect'),
                this
            );
        },
        outerRect: function() {
            return ui.outerRect(this.el);
        },
        placeholder: function(role, target) {
            return Promise.resolve({
                role: role,
                target: target || ''
            });
        },
        refresh: function() {
            this.$el.find('.crop').css(this.innerRect());
            this.ui.thumbLink.empty().append(this.placeholder('spinner'));
            make_renderer(Marionette.getOption(this, 'renderers'))
                .call(this, this.model)
                .bind(this)
                .then(function(thumbnail) {
                    if (!(functional.existy(thumbnail.el)
                            || functional.existy(thumbnail.role))) {
                        thumbnail.role = 'empty-item';
                    }
                    return thumbnail;
                })
                .then(function(thumbnail) {
                    this.ui.thumbLink
                        .empty()
                        .append(thumbnail.el)
                        .attr('data-role', thumbnail.role)
                        .attr('href', thumbnail.target);
                    this.trigger('ready');
                })
                .catch(function() {
                    this.ui.thumbLink.empty().attr('data-role', 'error');
                });
        },
        target: function() {
            return this.ui.thumbLink.attr('href');
        },
        onShow: function() {
            this.refresh();
            if (!_.isUndefined(this.model)) {
                this.listenTo(this.model, 'change', this.refresh);
            }
        }
    });
});
