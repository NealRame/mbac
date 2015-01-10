define(function(require) {
    var $ = require('jquery');
    var configuration = require('Configuration');
    var dashboard = require('Dashboard');

    configuration.set({
        gallery: {
            thumbnail: {
                width: 128,
                height: 128,
                margin: 4
            }
        }
    });

    $(dashboard.start.bind(dashboard));
});
