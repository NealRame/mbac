// define(function(require) {
//     var $ = require('jquery');
//     var Backbone = require('backbone');
//     var Foundation = require('foundation');
//     var Marionette = require('marionette');
//
//     var stickyFooter = require('utils/sticky-footer');
//
//     var Achievement = require('Achievement');
//     var LightBox = require('LightBox');
//
//     $(document).foundation();
//     $(window)
//         .bind('load', stickyFooter.bind(null, 0))
//         .bind('resize', Foundation.utils.throttle(stickyFooter.bind(null, 0), 150));
//     stickyFooter(0);
//
//     $('.achievement')
//         .each(function(index, item) {
//             var $item = $(item);
//
//             $item.find('figure > a:first-child').click(function(ev) {
//                 ev.preventDefault();
//                 ev.stopPropagation();
//
//                 var achievement = new (Achievement.extend({
//                     urlRoot: '/api/achievements'
//                 }))({_id: $item.attr('data-id')});
//
//                 achievement
//                     .once('change', function() {
//                         (new LightBox({model: this})).run();
//                     })
//                     .fetch();
//
//                 return false;
//             });
//         });
// });
