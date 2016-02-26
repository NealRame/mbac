/// Remove behavior.
/// ================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Feb 26 00:04:45 CET 2016
define(function(require) {
	'use strict';

    var Marionette = require('marionette');
    var Dialog = require('Dialog');

    return Marionette.Behavior.extend({
        defaults: {
            message: 'Are you sure you want to continue ?',
            accept: 'Yes',
            refuse: 'No'
        },
        onRemove: function() {
			var view = this.view;
            Dialog.prompt(this.options.message, {
                accept: view.removeModel.bind(view),
                acceptLabel: this.options.accept,
                refuseLabel: this.options.refuse
            });
        }
    });
});
