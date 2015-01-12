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
        template: function() {
            if (! _.isFunction(dialogTemplate)) {
                dialogTemplate = _.template(dialogTemplate);
            }
            return dialogTemplate({
                id:     Marionette.getOption(this, 'id')     || 'dialog'
                accept: Marionette.getOption(this, 'accept') || 'Oui',
                refuse: Marionette.getOption(this, 'refuse') || 'Non',
            });
        },
        exec: function() {
            var modal = this.$(this.modal);

            modal.foundation('reveal', 'open', {
                close_on_background_click: false,
                close_on_esc: false,
            });
            modal.on('closed', function() {
                modal.off();
                this.remove();
            });
        },
        quit: function() {
            this.$(this.modal).foundation('reveal', 'close');
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
            var id = Marionette.getOption(this, 'id') || 'dialog';

            if (_.isString(content)) {
                container.$el.html(content);
            } else {
                container.show(content);
            }

            this.modal = this.$('#' + id);
        }
    });


    return Dialog;
});
