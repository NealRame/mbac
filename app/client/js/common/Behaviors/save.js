/// Save behavior.
/// ==============
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Thu Feb 25 23:51:21 CET 2016
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');

    return Marionette.Behavior.extend({
        defaults: {
            message: 'Are you sure you want to save changes ?',
            accept: 'Yes',
            refuse: 'No'
        },
        onSave: function() {
			var view = this.view;
            if (_.result(view, 'edited', true)) {
                Dialog.prompt(this.options.message, {
                    accept: view.saveModel.bind(view),
                    acceptLabel: this.options.accept,
                    refuseLabel: this.options.refuse
                });
            }
        }
    });
});
