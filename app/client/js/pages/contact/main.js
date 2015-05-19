define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');

    function check_mail_address(address) {
        var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return re.test(address);
    }

    function add_error_message(elt, message) {
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

    function make_validator() {
        var args = _.toArray(arguments);
        return function(form, init, error, callback) {
            try {
                var data = _.reduce(args, function(memo, validator) {
                    var $field = $('#' + validator.id, form);
                    if ($field.length > 0 && $field.val) {
                        init($field);
                        var value = validator.validate($field.val(), error.bind(null, $field));
                        if (value && memo) {
                            memo[validator.id] = value;
                            return memo;
                        }
                    } else {
                        throw new Error(validator.id + ' is not a valid form field!');
                    }
                }, {});
                if (data) callback(data);
            } catch (err) {
                console.error(err);
            }
        };
    }

    var validate = make_validator(
        {
            id: 'name',
            validate: function(data, error_callback) {
                var value = data.trim();
                if (value.length > 0) {
                    return value;
                }
                error_callback('Vous devez indiquez votre nom');
            }
        },
        {
            id: 'email',
            validate: function(data, error_callback) {
                var value = data.trim();
                if (check_mail_address(value)) {
                    return value;
                }
                error_callback('Adresse email invalide');
            }
        },
        {
            id: 'subject',
            validate: function(data, error_callback) {
                var value = data.trim();
                if (value === 'info' || value === 'other') {
                    return value;
                }
                error_callback('Valeur du champ invalide');
            }
        },
        {
            id: 'message',
            validate: function(data, error_callback) {
                if (data.trim().length > 0) {
                    return data;
                }
                error_callback('Votre message est vide');
            }
        }
    );

    $('#contact-form-submit').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        validate($('#contact-form'), clear_error_message, add_error_message, function(data) {
            console.log(data);
        });
        return false;
    });

});
