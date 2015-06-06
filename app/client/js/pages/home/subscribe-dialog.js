// home/editor.js
// --------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed May 27 23:07:32 CEST 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Dialog = require('Dialog');
    var Marionette = require('marionette');
    var subscribeTemplate = require('text!pages/home/subscribe-dialog.html');
    var util = require('common/util');

    function field_value(field) {
        var value = _.result($(field), 'val');
        if (!_.isUndefined(value)) {
            return value;
        }
        throw new Error(field + ' is not a valid form field!');
    }

    var validate = util.makeFormValidator(
        {
            clearError: function(elt) {
                elt.css('margin-bottom', 16);
                elt.parent().find('.error').remove();
            },
            setError: function(elt, message) {
                elt.css('margin-bottom', 0)
                    .parent()
                    .append(
                        $(document.createElement('span'))
                            .addClass('error')
                            .append(message)
                    );
            }
        },
        function(form, clear_error, set_error) {
            var $field = $('#email', form);
            var value = field_value($field).trim();
            clear_error($field);
            if (util.checkMailAddress(value)) {
                return {'email_address': value};
            }
            set_error($field, 'Adresse email invalide');
        }
    );

    var SubscribeForm = Marionette.LayoutView.extend({
        attributes: {
            id: 'subscribe-form'
        },
        ui: {
            nameField: '#name',
            emailField: '#email'
        },
        template: _.template(subscribeTemplate)
    });

    var SubscribeDialog = Dialog.extend({
        initialize: function() {
            this.options.accept = 'Hop!';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        accept: function() {
            var data = validate(this.$('#subscribe-form > form'));
            if (data) {
                $.post('/api/contact/subscribe', data)
                    .done(function() {
                        console.log('success');
                        console.log(arguments);
                    })
                    .fail(function() {
                        console.log('error');
                        console.log(arguments);
                    });
                this.close();
            }
        },
        refuse: function() {
            this.close();
        },
        setContent: function(region) {
            region.show(new SubscribeForm());
        }
    });

    SubscribeDialog.open = function() {
        (new SubscribeDialog()).run();
    };

    return SubscribeDialog;
});
