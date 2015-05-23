define(function(require) {
    require('async!http://maps.googleapis.com/maps/api/js?key=AIzaSyBm7fdJUdMXrRbKJNDSM5Huds2Jjns8kzE&sensor=true');
    var _ = require('underscore');
    var $ = require('jquery');

    var map_canvas = $('#map-canvas');
    var lat_lng = new google.maps.LatLng(50.627557,3.052719);
    var options = {
        draggable: true,
        mapTypeControl: true,
        navigationControl: true,
        scaleControl: false,
        scrollwheel: false,
        center: lat_lng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(map_canvas.get(0), options);
    var mark = new google.maps.Marker({
        position: lat_lng,
        map: map,
        title: "mon Bar à Couture"
    });
});
