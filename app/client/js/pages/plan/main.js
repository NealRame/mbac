define(function(require) {
    require('async!http://maps.googleapis.com/maps/api/js?key=AIzaSyBm7fdJUdMXrRbKJNDSM5Huds2Jjns8kzE&sensor=true');
    var _ = require('underscore');
    var $ = require('jquery');
    var ui = require('common/ui');

    var PIN_IMAGE_URL = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    var map_canvas = $('#map-canvas');
    var mbac_lat_lng = new google.maps.LatLng(50.627557,3.052719);

    var options = {
        draggable: true,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        navigationControl: true,
        scaleControl: false,
        scrollwheel: false,
        streetViewControl: false,
        zoom: 15
    };
    var map = new google.maps.Map(map_canvas.get(0), options);
    var markers = {
        home: new google.maps.Marker({
            position: mbac_lat_lng,
            map: map,
            title: "mon Bar à Couture",
        }),
        bicycle: new google.maps.Marker({
            position: new google.maps.LatLng(50.626093, 3.051778),
            map: map,
            title: 'Station V\'Lille 40 métro Gambetta',
            visible: false,
            icon: PIN_IMAGE_URL,
        }),
        subway: new google.maps.Marker({
            position: new google.maps.LatLng(50.626368, 3.052228),
            map: map,
            title: 'Station métro Gambetta',
            visible: false,
            icon: PIN_IMAGE_URL,
        }),
        car: new google.maps.Marker({
            position: new google.maps.LatLng(50.626056, 3.049799),
            map: map,
            title: 'Parking de la place de la Bonne Aventure',
            visible: false,
            icon: PIN_IMAGE_URL,
        })
    };

    function resize_map() {
        switch (ui.mediaQuery()) {
            case 'small':
                map_canvas.height(Math.round(map_canvas.width()*3/4));
                break;
            default:
                map_canvas.height(Math.round(map_canvas.width()*2/3));
                break;
        }
        map.setCenter(mbac_lat_lng);
    }

    resize_map();
    $(window).on('resize', _.debounce(resize_map, 100));
    $('#bicycle, #subway, #car').on('click', function() {
        var elt = $(this);
        var marker = markers[elt.attr('id')];
        marker.setVisible(true);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setVisible(false);
        }, 2000);
    });
});
