define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        onStart: function() {
            this.layout.showChildView('menu', new ApplicationMenu());
        }
    });

    var app = new Application();
    app.start();
});
