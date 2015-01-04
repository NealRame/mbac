define(function(require) {
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var Controller = function(application) {
        this.application = application;
        this.router = new Marionette.AppRouter({
            controller: this,
            appRoutes: {
                '*panel': 'switchPanel'
            }
        });
    };
    _.extend(Controller.prototype, {
        start: function() {
            console.log('-- Starting Controller');
            Backbone.history.start();
            console.log('-- Starting Controller - done');
        },
        switchPanel: function(panel) {
            Backbone.Wreqr.radio.channel('global').vent.trigger(
                'dashboard:switchPanel', panel
            );
        }
    });

    return Controller;
});
