define(function(require) {
    var $ = require('jquery');
    var dashboard = require('back/dashboard');

    $(dashboard.start.bind(dashboard));
});
