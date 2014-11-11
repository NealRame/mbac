define(function(require) {
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Layout = require('back/dashboard.layout');
    var Menu = require('back/menu/menu');

    var Controller = function() {
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

            this.layout = new Layout({
                el: '#dashboard'
            });

            this.menu = new Menu({labelRight: true});
            this.menu.addItems([
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

            this.layout.render();
            this.layout.menu.show(this.menu);

            console.log('-- Starting Controller - done!');
        },
        switchPanel: function(panel) {
            var panel = panel || 'gallerie';
            console.log('-- Switching to panel: ' + panel);
            this.menu.setActiveItem(panel);
            console.log('-- Switching to panel: ' + panel + ' - done!');
        }
    });

    return Controller;
});
