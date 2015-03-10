define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Foundation = require('foundation');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Controller = require('back/dashboard.controller');
    var TabbedPanels = require('TabbedPanels');
    var Gallery = require('Gallery');
    var Test = require('Test');
    var stickyFooter = require('utils/sticky-footer');

    var Dashboard = Marionette.Application.extend({
        initialize: function(options) {
            this.window = $(window);
            this.document = $(document);
            this.container = $((options && options.container) || '#dashboard');
            this.controller = new Controller(this);
            this.tabbedPanels = new TabbedPanels({
                el: this.container
            });
            this.tabbedPanels.addPanel([
                {
                    id: 'blog',
                    label: 'Blog',
                    icon: 'fa fa-rss'
                }, {
                    id: 'gallerie',
                    label: 'Gallerie',
                    icon: 'fa fa-camera-retro',
                    view: function() {
                        return new Gallery;
                    }
                }, {
                    id: 'pages',
                    label: 'Pages',
                    icon: 'fa fa-file-o'
                }, {
                    id: 'test',
                    label: 'Test',
                    icon: 'fa fa-flask',
                    view: function() {
                        return new Test;
                    }
                }
            ]);
            var channel = Backbone.Wreqr.radio.channel('global');
            this.listenTo(channel.vent, 'dashboard:switchPanel', this.onSwitchPanel);
        },
        onSwitchPanel: function(panel) {
            this.tabbedPanels.switchPanel(panel || 0);
        },
        onBeforeStart: function() {
            this.container.bind('DOMSubtreeModified', (function() {
                this.document.foundation();
                stickyFooter(0);
            }).bind(this));
            this.window.bind('resize', Foundation.utils.throttle(stickyFooter.bind(null, 0), 150));
        },
        onStart: function(options) {
            console.log('-- Dashboard: start');
            this.tabbedPanels.render();
            this.controller.start();
            console.log('-- Dashboard: start - done');
        }
    });

    return new Dashboard;
});
