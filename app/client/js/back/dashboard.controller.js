define(function(require) {
    var Backbone = require('backbone');
    var Marionette = require('marionette');

    var TabbedPanels = require('back/TabbedPanels/tabbedpanels');

    var Controller = function() {
        this.router = new Marionette.AppRouter({
            controller: this,
            appRoutes: {
                '*panel': 'switchPanel'
            }
        });
        this.tabbedPanels = new TabbedPanels({
            el: '#dashboard'
        });
        this.tabbedPanels.addPanel([
            {
                id: 'blog',
                label: 'Blog',
                icon: 'fa fa-rss' },
            {
                id: 'gallerie',
                label: 'Gallerie',
                icon: 'fa fa-camera-retro' },
            {
                id: 'pages',
                label: 'Pages',
                icon: 'fa fa-file-o' }
        ]);
    };
    _.extend(Controller.prototype, {
        start: function() {
            console.log('-- Starting Controller');
            this.tabbedPanels.render();
            console.log('-- Starting Controller - done');
        },
        switchPanel: function(panel) {
            this.tabbedPanels.switchPanel(panel || 0);
        }
    });

    return Controller;
});
