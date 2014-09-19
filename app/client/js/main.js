require.config({
    paths: {
        // Backbone
        'backbone':               'vendors/backbone',
        // JQuery
        'jquery':                 'vendors/jquery',
        'jquery.cookie':          'vendor/jquery.cookie',
        // Fastclick
        'fastclick':              'vendors/fastclick',
        // Foundation
        'foundation.core':        'vendors/foundation',
        'foundation.abide':       'vendors/foundation.abide',
        'foundation.accordion':   'vendors/foundation.accordion',
        'foundation.alert':       'vendors/foundation.alert',
        'foundation.clearing':    'vendors/foundation.clearing',
        'foundation.dropdown':    'vendors/foundation.dropdown',
        'foundation.equalizer':   'vendors/foundation.equalizer',
        'foundation.interchange': 'vendors/foundation.interchange',
        'foundation.magellan':    'vendors/foundation.magellan',
        'foundation.offcanvas':   'vendors/foundation.offcanvas',
        'foundation.orbit':       'vendors/foundation.orbit',
        'foundation.reveal':      'vendors/foundation.reveal',
        'foundation.tab':         'vendors/foundation.tab',
        'foundation.tooltip':     'vendors/foundation.tooltip',
        'foundation.topbar':      'vendors/foundation.topbar',
        // Modernizr
        'modernizr':              'vendors/modernizr',
        // Placeholder
        'placeholder':            'vendors/placeholder',
        // React
        'react':                  'vendors/react',
        // Underscore
        'underscore':             'vendors/underscore',
    },
    shim: {
        'fastclick':              {exports: 'FastClick'},
        'modernizr':              {exports: 'Modernizr'},
        'placeholder':            {exports: 'Placeholders'},
        'foundation.core': {
            deps: ['jquery', 'modernizr'],
            exports: 'Foundation'
        },
        'foundation.abide':       {deps: ['foundation.core']},
        'foundation.accordion':   {deps: ['foundation.core']},
        'foundation.alert':       {deps: ['foundation.core']},
        'foundation.clearing':    {deps: ['foundation.core']},
        'foundation.dropdown':    {deps: ['foundation.core']},
        'foundation.equalizer':   {deps: ['foundation.core']},
        'foundation.interchange': {deps: ['foundation.core']},
        'foundation.magellan':    {deps: ['foundation.core']},
        'foundation.offcanvas':   {deps: ['foundation.core']},
        'foundation.orbit':       {deps: ['foundation.core']},
        'foundation.reveal':      {deps: ['foundation.core']},
        'foundation.tab':         {deps: ['foundation.core']},
        'foundation.tooltip':     {deps: ['foundation.core']},
        'foundation.topbar':      {deps: ['foundation.core']}
    },
});

require(
    ['jquery', 'foundation.core', 'foundation.topbar', 'sticky-footer'],
    function($, Foundation) {
        var stickyFooter = require('sticky-footer');
        $(document).foundation();
        $(window)
            .bind('load', stickyFooter.bind(null, 20))
            .bind('resize', Foundation.utils.throttle(stickyFooter.bind(null, 0), 150));
        stickyFooter(20);
});
