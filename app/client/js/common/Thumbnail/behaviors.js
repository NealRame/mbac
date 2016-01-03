/// Thumbnail link click behavior.
/// ==============================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Jan  3 18:31:56 CET 2016
define(function(require) {
    'use strict';

    var Marionette = require('marionette');
    var Dialog = require('Dialog');

    return {
        click: Marionette.Behavior.extend({
            defaults: {
                event: 'item-click'
            },
            events: {
                'click @ui.thumbLink': 'onThumbLinkClicked'
            },
            onThumbLinkClicked: function(ev) {
                if (Marionette.getOption(this.view, 'clickBehavior') === 'trigger') {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.view.trigger(this.options.event);
                    return false;
                }
            }
        }),
        remove: Marionette.Behavior.extend({
            defaults: {
                message: 'Êtes vous sûr de supprimer cet item ?'
            },
            events: {
                'click @ui.removeLink': 'onRemoveLinkClicked'
            },
            onRemoveLinkClicked: function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var model = this.view.model;
                Dialog.prompt(
                    this.options.message, {
                        accept: model.destroy.bind(model),
                        acceptLabel: 'Oui',
                        refuseLabel: 'Non'
                    }
                );
                return false;
            }
        })
    }
});
