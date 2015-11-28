/// /pages/home/notification/edit-view.js
/// -------------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Nov 28 18:39:30 CET 2015
define(function(require) {
    'use strict';

    require('foundation-datepicker-fr');

    var _ = require('underscore');
    // var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');

    var template = require('text!pages/home/notification/edit-view.html');

    var NotificationEditor = Marionette.ItemView.extend({
        ui: {
            descField: '#description',
            endDateButton: '#end-date-button',
            startDateButton: '#start-date-button'
        },
        events: {
            'click @ui.endDateButton': 'onChangeEndDateClicked',
            'click @ui.startDateButton': 'onChangeStartDateClicked',
            'changeDate @ui.endDateButton': 'onEndDateChanged',
            'changeDate @ui.startDateButton': 'onStartDateChanged'
        },
        className: 'notification-editor',
        template: _.template(template),
        onShow: function() {
            var options = {
                language: 'fr',
                pickTime: true
            };
            this.ui.endDateButton.fdatepicker(options);
            this.ui.startDateButton.fdatepicker(options);
        },
        onChangeEndDateClicked: function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.ui.endDateButton.fdatepicker('show');
            return false;
        },
        onChangeStartDateClicked: function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.ui.startDateButton.fdatepicker('show');
            return false;
        },
        onEndDateChanged: function(ev) {
            console.log(this.ui.endDateButton.data('datepicker').date);
        },
        onStartDateChanged: function(ev) {
            console.log(this.ui.startDateButton.data('datepicker').date);
        }
    });

    var NotificationEditorDialog = Dialog.extend({
        childView: NotificationEditor,
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter' : 'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
    });

    NotificationEditorDialog.open = function(notification) {
        (new NotificationEditorDialog({model: notification})).run();
    };

    return NotificationEditorDialog;
});
