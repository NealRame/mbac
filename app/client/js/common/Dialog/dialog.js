/// Dialog/dialog.js
/// ----------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Jan 12
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Marionette = require('marionette');
    var functional = require('common/functional');
    var dialogTemplate = require('text!common/Dialog/dialog.template.html');

    var Dialog = Marionette.LayoutView.extend({
        ui: {
            accept: '#accept',
            refuse: '#refuse'
        },
        template: _.template(dialogTemplate),
        templateHelpers: function() {
            return {
                accept: Marionette.getOption(this, 'accept') || 'Ok',
                refuse: Marionette.getOption(this, 'refuse') || false
            };
        },
        run: function() {
            $('body').append(this.render().el);
            this.open();
        },
        open: function() {
            this.$el.removeAttr('style');
            this.$el.foundation('reveal', 'open', {
                close_on_background_click: false,
                close_on_esc: false
            });
        },
        onAccept: function() {
            this.close();
        },
        onRefuse: function() {
            this.close();
        },
        close: function() {
            $().add(this.ui.accept).add(this.ui.refuse).off('click');
            if (this.$el.hasClass('open')) {
                $(document).one('closed.fndtn.reveal', this.remove.bind(this));
                this.$el.foundation('reveal', 'close');
            } else {
                this.remove();
            }
        },
        onRender: function() {
            var ChildView = Marionette.getOption(this, 'childView');
            var options = Marionette.getOption(this, 'childViewOptions');
            var dialog = this;

            this.child = new ChildView(functional.valueOf(options, this));
            this.$el.addClass('reveal-modal').attr('data-reveal', '');
            this.addRegions({
                'contentWrapper': {
                    regionClass: Marionette.Region.extend({
                        el: this.$('#dialog-content-wrapper')
                    })
                }
            });

            $().add(this.ui.accept).add(this.ui.refuse)
                .off('click')
                .on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var data = _.result(dialog.child, 'data');
                    switch($(this).attr('id')) {
                        case 'accept':
                            dialog.onAccept(data);
                            break;
                        case 'refuse':
                            dialog.onRefuse(data);
                            break;
                    }
                    return false;
                });

            if (ChildView) {
                this.getRegion('contentWrapper').show(this.child);
            }
        }
    });

    Dialog.prompt = function(message, options) {
        var settings = {
            el: options.el,
            className: 'small',
            id: 'prompt-box',
            accept: options.acceptLabel || 'Yes',
            refuse: options.refuseLabel || 'No'
        };
        (new (Dialog.extend({
            childView: Marionette.ItemView.extend({
                template: _.template('<p><%= message %></p>'),
                templateHelpers: function() {
                    return {message: message};
                }
            }),
            onAccept: function() {
                if (options.accept) {
                    options.accept();
                }
                this.close();
            },
            onRefuse: function() {
                if (options.refuse) {
                    options.refuse();
                }
                this.close();
            }
        }))(settings)).run();
    };

    Dialog.message = function(message, options) {
        var settings = {
            el: options.el,
            className: 'small',
            id: 'message-box',
            accept: options.acceptLabel || 'Yes'
        };
        (new (Dialog.extend({
            childView: Marionette.ItemView.extend({
                template: _.template('<p><%= message %></p>'),
                templateHelpers: function() {
                    return {message: message};
                }
            }),
            onAccept: function() {
                if (options.accept) {
                    options.accept();
                }
                this.close();
            }
        }))(settings)).run();
    };

    return Dialog;
});
