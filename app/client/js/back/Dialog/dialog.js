defined(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var dialogTemplate = require('text!back/Dialog/dialog.template.html');

    var Dialog = Marionette.LayoutView.extend({
        regions: {
            container: '#dialog-content-wrapper'
        },
        ui: {
            acceptButton: '#accept',
            refuseButton: '#refuse',
        },
        events: {
            'click @ui.acceptButton': 'onAccept',
            'click @ui.refuseButton': 'onRefuse',
        },
        initialize: function() {
            this.template = (function() {
                if (! _.isFunction(dialogTemplate)) {
                    dialogTemplate = _.template(dialogTemplate);
                }

                var compiled = dialogTemplate({
                    id:     Marionette.getOption(this, 'id')     || 'dialog',
                    accept: Marionette.getOption(this, 'accept') || 'Oui',
                    refuse: Marionette.getOption(this, 'refuse') || 'Non',
                });

                return compiled;
            }).bind(this);
            this.render();
        },
        open: function() {
            this.modal.foundation('reveal', 'open', {
                close_on_background_click: false,
                close_on_esc: false,
            });
        },
        close: function() {
            this.modal.foundation('reveal', 'close');
        },
        onAccept: function(e) {
            console.log('-- Dialog:onAccept');
            e.preventDefault();
            e.stopPropagation();
            this.trigger('accept');
            this.close();
            return false;
        },
        onRefuse: function(e) {
            console.log('-- Dialog:onRefuse');
            e.preventDefault();
            e.stopPropagation();
            this.trigger('refuse');
            this.close();
            return false;
        },
        onRender: function() {
            var container = this.getRegion('container');
            var content = Marionette.getOption(this, 'content') || '';

            if (_.isString(content)) {
                container.$el.html(content);
            } else {
                container.show(content);
            }

            this.modal = this.$('#' + (Marionette.getOption(this, 'id') || 'dialog'));
            this.modal.one('closed', (function() {
                this.remove();
            }).bind(this));
        }
    });


    return Dialog;
});
