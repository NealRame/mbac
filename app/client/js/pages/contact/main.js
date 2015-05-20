define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');

    function check_mail_address(address) {
        var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return re.test(address);
    }

    function set_error_message(elt, message) {
        elt.css('margin-bottom', 0)
            .parent()
            .append(
                $(document.createElement('span'))
                    .addClass('error')
                    .append(message)
            );
    }

    function clear_error_message(elt) {
        elt.css('margin-bottom', 16);
        elt.parent().find('.error').remove();
    }

    function field_value(field) {
        var value = _.result($(field), 'val');
        if (! _.isUndefined(value)) {
            return value;
        }
        console.log(field);
        throw new Error(field + ' is not a valid form field!');
    }

    function make_validator() {
        var args = _.toArray(arguments);
        return function(form, clear_error, set_error, callback) {
            try {
                var data = _.reduce(args, function(memo, validate) {
                    var value = validate(form, clear_error, set_error);
                    if (value && memo) {
                        return _.extend(memo, value);
                    }
                }, {});
                if (data) {
                    callback(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
    }

    var validate = make_validator(
        function(form, clear_error, set_error) {
            var $field = $('#name', form);
            var value = field_value($field).trim();
            clear_error($field);
            if (value.length > 0) {
                return {'name': value};
            }
            set_error($field, 'Vous devez indiquez votre nom');
        },
        function(form, clear_error, set_error) {
            var $field = $('#from', form);
            var value = field_value($field).trim();
            clear_error($field);
            if (check_mail_address(value)) {
                return {'from': value};
            }
            set_error($field, 'Adresse email invalide');
        },
        function(form, clear_error, set_error) {
            var $field = $('#subject', form);
            var value = field_value($field);
            clear_error($field);
            switch (value) {
                case 'info':
                case 'other':
                    return {'subject': value};
                default:
                    set_error($field, 'Valeur du champ invalide');
                    break;
            }
        },
        function(form, clear_error, set_error) {
            var $field = $('#message', form);
            var value = field_value($field);
            clear_error($field);
            if (value.trim().length > 0) {
                return {'message': value};
            }
            set_error($field, 'Votre message est vide');
        }
    );

    $('#contact-form-submit').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        validate($('#contact-form'), clear_error_message, set_error_message, function(data) {
            console.log(data);
        });
        return false;
    });

});
