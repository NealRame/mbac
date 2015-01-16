// Dialog/dialog.js
// ----------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sun Jan 12
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var dialogTemplate = require('text!common/Dialog/dialog.template.html');

    var Dialog = Marionette.LayoutView.extend({
        ui: {
            accept: '#accept',
            refuse: '#refuse',
        },
        initialize: function() {
            this.options = _.defaults(
                _.pick(this.options, 'accept', 'refuse'), {accept: 'Ok'}
            );
            this.template = (function() {
                if (! _.isFunction(dialogTemplate)) {
                    dialogTemplate = _.template(dialogTemplate);
                }
                return dialogTemplate(this.options);
            }).bind(this);
        },
        open: function() {
            this.$el.removeAttr('style');
            this.$el.foundation('reveal', 'open', {
                close_on_background_click: false,
                close_on_esc: false,
            });
        },
        close: function() {
            console.log('-- Dialog:close');
            $().add(this.ui.accept).add(this.ui.refuse).off('click');
            this.$el.one('closed', (function() {
                console.log('-- Dialog:closed');
                this.remove();
            }).bind(this));
            this.$el.foundation('reveal', 'close');
        },
        accept: function() {
        },
        refuse: function() {
        },
        setContent: function() {
        },
        getContent: function() {
            return this.getRegion('contentWrapper');
        },
        onRender: function() {
            console.log('-- Dialog:onRender');

            var dialog = this;

            this.addRegions({
                'contentWrapper': {
                    regionClass: Marionette.Region.extend({
                        el: this.$('#dialog-content-wrapper')
                    })
                }
            });
            this.$el.addClass('reveal-modal').attr('data-reveal', '');

            $().add(this.ui.accept).add(this.ui.refuse)
                .off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    switch($(this).attr('id')) {
                    case 'accept':
                        console.log('-- Dialog:onAccept');
                        (dialog.accept || dialog.close).call(dialog);
                        break;
                    case 'refuse':
                        console.log('-- Dialog:onRefuse');
                        (dialog.refuse || dialog.close).call(dialog);
                        break;
                    }

                    return false;
                });

            this.setContent(this.getRegion('contentWrapper'));
        }
    });

    Dialog.createMessageBox = function(message, options) {
        var settings = {};

        if (options.el) {
            settings.el = options.el;
        }

        if (options.acceptLabel) {
            settings.accept = options.acceptLabel;
        }

        if (options.refuseLabel) {
            settings.refuse = options.refuseLabel;
        }

        return (new (Dialog.extend({
            accept: function() {
                if (options.accept) {
                    options.accept();
                }
                this.close();
            },
            refuse: function() {
                if (options.refuse) {
                    options.refuse();
                }
                this.close();
            },
            setContent: function(region) {
                region.$el.append($(document.createElement('p')).html(message));
            }
        }))(settings)).render();
    };

    return Dialog;
});
