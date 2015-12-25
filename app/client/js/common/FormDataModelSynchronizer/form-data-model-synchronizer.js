// FormData model synchronisation helpers.
// =======================================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Dec 25 18:22:17 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');

    return function(create_form_data) {
        return {
            sync: function(method, model, options) {
                switch (method.toLowerCase()) {
                case 'create':
                case 'update':
                case 'patch':
                    return (function() {
                        var form_data = create_form_data(model);
                        var xhr = Backbone.ajax(_.extend({
                            data: form_data,
                            contentType: false,
                            processData: false,
                            type: method === 'create' ? 'POST' : 'PUT',
                            url: options.url || model.url()
                        }, options));
                        model.trigger('request', model, xhr, options);
                        return xhr;
                    })();
                default:
                    return Backbone.sync.call(this, method, model, options);
                }
            }
        };
    };
});
