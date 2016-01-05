/// products.MenuView
/// =================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Dec 21 22:43:33 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var functional = require('common/functional');

    var list_menu_template = require('text!pages/achievements/back/menu/list-menu.html');
    var edit_menu_template = require('text!pages/achievements/back/menu/edit-menu.html');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var menu_proto = {
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({})
    };

    return Marionette.LayoutView.extend(_.assign({
        ui: {
            'remove': '#remove-achievement',
            'save': '#save-achievement'
        },
        events: {
            'click @ui.remove': 'onRemove',
            'click @ui.save': 'onSave'
        },
        getTemplate: function() {
            if (this.mode === 'list') {
                return _.template(list_menu_template);
            }
            if (this.mode === 'edit') {
                return _.template(edit_menu_template);
            }
            return false;
        },
        initialize: function() {
            this.mode = 'list';
            app_channel.commands.setHandler('route', this.onRoute.bind(this));
        },
        onRemove: function(ev) {
            console.log('-- remove clicked');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onSave: function(ev) {
            console.log('-- save clicked');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onRoute: functional.dispatch(
            function(route) {
                console.log('-- onRoute', route);
                if (route === 'achievements') {
                    this.mode = 'list';
                    this.render();
                    return true;
                }
            },
            function(route) {
                console.log('-- onRoute', route);
                if (route === 'editAchievement') {
                    this.mode = 'edit';
                    this.render();
                    return true;
                }
            }
        ),
        regions: {
            'achievements-submenu-wrapper': '#achievements-submenu-wrapper'
        }
    }, menu_proto));
});
