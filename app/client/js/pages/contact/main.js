define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Dialog = require('Dialog');
    var util = require('common/util');

    function field_value(field) {
        var value = _.result($(field), 'val');
        if (!_.isUndefined(value)) {
            return value;
        }
        throw new Error(field + ' is not a valid form field!');
    }

    function set_error(elt, message) {
        elt.css('margin-bottom', 0)
            .parent()
            .append(
                $(document.createElement('span'))
                    .addClass('error')
                    .append(message)
            );
    }

    function clear_error(elt) {
        elt.css('margin-bottom', 16);
        elt.parent().find('.error').remove();
    }

    function reset(form) {
        $('#name', form).val('');
        $('#from', form).val('');
        $('#message', form).val('');
    }

    var validate = util.makeFormValidator(
        {
            clearError: clear_error,
            setError: set_error
        },
        function(form, clear_err, set_err) {
            var $field = $('#name', form);
            var value = field_value($field).trim();
            clear_err($field);
            if (value.length > 0) {
                return {'name': value};
            }
            set_err($field, 'Vous devez indiquez votre nom');
        },
        function(form, clear_err, set_err) {
            var $field = $('#from', form);
            var value = field_value($field).trim();
            clear_err($field);
            if (util.checkMailAddress(value)) {
                return {'from': value};
            }
            set_err($field, 'Adresse email invalide');
        },
        function(form, clear_err, set_err) {
            var $field = $('#subject', form);
            var value = field_value($field);
            clear_err($field);
            switch (value) {
                case 'info':
                case 'other':
                    return {'subject': value};
                default:
                    set_err($field, 'Valeur du champ invalide');
                    break;
            }
        },
        function(form, clear_err, set_err) {
            var $field = $('#message', form);
            var value = field_value($field);
            clear_err($field);
            if (value.trim().length > 0) {
                return {'message': value};
            }
            set_err($field, 'Votre message est vide');
        }
    );

    $('#contact-form-submit').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var $form = $('#contact-form');
        var data = validate($form);
        if (data) {
            $.post('/api/contact/mail', data)
                .done(function() {
                    Dialog.message('Votre message a bien été transmis.', {
                        acceptLabel: 'Ok',
                        accept: reset.bind(null, $form)
                    });
                })
                .fail(function() {
                    console.log('error');
                    console.log(arguments);
                });
        }
        return false;
    });

});
