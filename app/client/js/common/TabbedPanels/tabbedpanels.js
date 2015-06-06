/// TabbedPanels/tabbedpanels.js
/// ----------------------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Mon Jan  5 00:59:15 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var tabbedPanelsTemplate = require('text!common/TabbedPanels/tabbedpanels.html');
    var tabbarItemTemplate = require('text!common/TabbedPanels/tabbar-item.html');
    var menuClasses = {
        1: 'one-up',  2: 'two-up',  3: 'three-up',
        4: 'four-up', 5: 'five-up', 6: 'six-up'
    };
    var next_panel_id = 0;

    var Panel = Backbone.Model.extend({
        defaults: function() {
            var id = next_panel_id++;
            return {
                active: false,
                id: 'item' + id,
                label: 'Item' + id,
                view: function() {
                    return new Marionette.ItemView({
                        template: false
                    });
                }
            };
        },
        label: function() {
            return this.get('label');
        },
        isActive: function() {
            return this.get('active');
        },
        setActive: function(state) {
            this.set('active', state);
        },
        createView: function() {
            return this.get('view').call(this);
        }
    });

    var ItemView = Marionette.ItemView.extend({
        tagName: 'a',
        className: 'item',
        template: _.template(tabbarItemTemplate),
        attributes: function() {
            return {
                href: '#/' + (this.model.id || this.model.cid)
            };
        },
        onBeforeRender: function() {
            this.$el.attr('data-state', this.model.isActive() ? 'active':'');
        }
    });

    var TabBarView = Marionette.CollectionView.extend({
        childView: ItemView,
        tagName: 'div',
        initialize: function() {
            this.configure({
                labelRight: false
            });
            this.listenTo(this.collection, 'change', this.render);
        },
        configure: function(config) {
            this.config = _.extend(
                this.config || {},
                _.pick(config || {}, 'labelRight')
            );
            return this;
        },
        onBeforeRender: function() {
            var classes = [ 'items' ];

            classes.push(menuClasses[this.collection.length]);
            if (this.config.labelRight) {
                classes.push('label-right');
            }
            this.$el.removeClass().addClass(classes.join(' '));
        },
        setActiveItem: function(panel) {
            panel.setActive(true);
            this.collection.chain().without(panel).each(function(p) {
                p.setActive(false);
            });
        }
    });


    var TabbedPanels = Marionette.LayoutView.extend({
        regions: {
            tabBar: '.tab-bar',
            panel:  '.tab-panel'
        },
        template: _.template(tabbedPanelsTemplate),
        initialize: function() {
            this.collection = new Backbone.Collection([], {
                model: Panel
            });
            this.tabBar = new TabBarView({
                collection: this.collection
            });
        },
        configure: function(config) {
            this.tabBar.configure(config);
            return this;
        },
        addPanel: function(panel) {
            this.collection.add(panel);
        },
        switchPanel: function(panel_id) {
            var panel =
                (_.isString(panel_id)
                    ? this.collection.get
                    : this.collection.at).call(this.collection, panel_id);

            if (panel) {
                this.tabBar.setActiveItem(panel);
                this.getRegion('panel').show(panel.createView());
            }
        },
        onRender: function() {
            this.getRegion('tabBar').show(this.tabBar);
        }
    });

    return TabbedPanels;
});
