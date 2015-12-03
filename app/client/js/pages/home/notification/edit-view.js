 /// /pages/home/notification/edit-view.js
/// -------------------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sat Nov 28 18:39:30 CET 2015
define(function(require) {
    'use strict';

    require('foundation-datepicker-fr');

    var _ = require('underscore');
    var $ = require('jquery');
    var Marionette = require('marionette');
    var Dialog = require('Dialog');

    var template = require('text!pages/home/notification/edit-view.html');

    var NotificationEditor = Marionette.ItemView.extend({
        ui: {
            descField: '#description',
            endDateLabel: '#end-date-input',
            startDateLabel: '#start-date-input',
            endDateButton: '#end-date-button',
            startDateButton: '#start-date-button',
            publishSwitch: '#publish-switch'
        },
        events: {
            'change @ui.descField': 'onDescriptionChanged',
            'click @ui.endDateButton': 'onChangeEndDateClicked',
            'click @ui.startDateButton': 'onChangeStartDateClicked',
            'changeDate @ui.endDateButton': 'onEndDateChanged',
            'changeDate @ui.startDateButton': 'onStartDateChanged',
            'change @ui.publishSwitch': 'onPublishSwitchChanged'
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
            this.ui.descField.val(this.model.message());
            this.ui.startDateLabel.val(this.model.startDateString());
            this.ui.endDateLabel.val(this.model.endDateString());
        },
        onChangeEndDateClicked: function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.ui.endDateButton.fdatepicker('show');
            return false;
        },
        onChangeStartDateClicked: function(ev) {
            this.ui.startDateButton.fdatepicker('show');
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        },
        onDescriptionChanged: function(ev) {
            this.model.setMessage($(ev.target).val());
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        },
        onEndDateChanged: function(ev) {
            var date = this.ui.endDateButton.data('datepicker').date;
            this.model.setEndDate(date);
            this.ui.endDateLabel.val(this.model.endDateString());
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        },
        onStartDateChanged: function(ev) {
            var date = this.ui.startDateButton.data('datepicker').date;
            this.model.setStartDate(date);
            this.ui.startDateLabel.val(this.model.startDateString());
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        },
        onPublishSwitchChanged: function(ev) {
            this.model.setPublished(ev.target.checked);
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        },
        data: function() {
            return this.model;
        }
    });

    var NotificationEditorDialog = Dialog.extend({
        className: 'medium',
        childView: NotificationEditor,
        childViewOptions: function() {
            return {
                model: this.model.clone()
            };
        },
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter' : 'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        onAccept: function(model) {
            var commit = (function() {
                this.model.set(model.toJSON());
                this.model.save();
                this.close();
            }).bind(this);

            if (!this.model.isNew()) {
                var editor = this;
                Dialog.prompt(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Annuler'
                    }
                );
            } else commit();
        },
        onRefuse: function(model) {
            var commit = (function() {
                if (this.model.isNew()) {
                    this.model.destroy();
                }
                this.close();
            }).bind(this);

            if (model.hasChanged()) {
                var editor = this;
                Dialog.prompt(
                    'Les modifications apportées seront perdues! Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Oui',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Non'
                    }
                );
            } else commit();

            return false;
        }
    });

    NotificationEditorDialog.open = function(notification) {
        (new NotificationEditorDialog({model: notification})).run();
    };

    return NotificationEditorDialog;
});
