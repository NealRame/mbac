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

    $('#contact-form-submit').click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var $form = $('#contact-form');
        var $name = $('#name', $form);
        var name = $name.val().trim();
        var $addr=$('#email', $form);
        var addr=$addr.val().trim();
        var $subject=$('#subject', $form);
        var subject=$subject.val();
        var $message = $('#message', $form);
        var message = $message.val();

        var ok = true;

        clear_error_message($form.children());

        if (name.length === 0) {
            add_error_message($name, 'Vous devez indiquez votre nom');
            ok = false;
        }

        if (! check_mail_address(addr)) {
            add_error_message($addr, 'Addresse invalide');
            ok = false;
        }

        if (message.trim().length === 0) {
            add_error_message($message, 'Votre message est vide');
            ok = false;
        }

        return false;
    });

});
