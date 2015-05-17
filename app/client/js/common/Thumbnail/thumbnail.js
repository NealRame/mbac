/// Thumbnail/thumbnail.js
/// ----------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Mar 10 21:55:49 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Promise = require('promise');

    var functional = require('common/functional');
    var ui = require('common/ui');
    var thumbnailTemplate = require('text!common/Thumbnail/thumbnail.html');

    var file_render = require('common/Thumbnail/file-render');
    var picture_render = require('common/Thumbnail/picture-render');

    var renderers = [
        file_render,
        picture_render,
        function() {
            return Promise.resolve({
                el: this.placeholder('unknown'),
                target: ''
            });
        }
    ];

    function make_renderer(custom_renderers) {
        return functional.dispatch.apply(
            null, functional.cat(custom_renderers || [], renderers)
        );
    }

    var ThumbnailLinkBehavior = Marionette.Behavior.extend({
        events: {
            'click @ui.thumbLink': 'onThumbLinkClicked'
        },
        onThumbLinkClicked: function(ev) {
            if (Marionette.getOption(this.view, 'clickBehavior') === 'trigger') {
                ev.preventDefault();
                ev.stopPropagation();
                this.view.trigger('click');
                return false;
            }
        }
    });

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
        behaviors: {
            thumbLink: {
                behaviorClass: ThumbnailLinkBehavior
            }
        },
        clickBehavior: 'trigger',
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
            if (this.isEditable()) {
                data.actions.push({
                    name: 'edit',
                    icon: 'fa fa-pencil'
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
        placeholder: function(type, ratio) {
            ratio = ratio || 1;

            var classes = {
                spinner: 'fa fa-circle-o-notch fa-spin',
                empty: 'fa fa-ban fa-fw',
                error: 'fa fa-exclamation-circle fa-fw',
                unknown: 'fa fa-question-circle'
            };
            var rect = this.innerRect();
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
        refresh: function() {
            this.$el.find('.crop').css(this.innerRect());
            this.ui.thumbLink.empty().append(this.placeholder('spinner'));
            make_renderer(Marionette.getOption(this, 'renderers'))
                .call(this, this.model)
                .bind(this)
                .then(function(thumbnail) {
                    this.ui.thumbLink
                        .empty()
                        .append(thumbnail.el || this.placeholder('empty'));
                    if (Marionette.getOption(this, 'clickBehavior') !== 'none') {
                        this.ui.thumbLink.attr('href', thumbnail.target);
                    }
                    this.trigger('ready');
                })
                .catch(function() {
                    this.ui.thumbLink.empty().append(this.placeholder('error'));
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
            this.refresh();
            if (!_.isUndefined(this.model)) {
                this.listenTo(this.model, 'change', this.refresh);
            }
        },
    });
});
