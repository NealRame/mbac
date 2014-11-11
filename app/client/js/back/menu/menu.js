define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;
    var itemTemplate = require('text!back/menu/menu.item.template.html');
    var menuClasses = [
        '',
        'one-up',
        'two-up',
        'three-up',
        'four-up',
        'five-up',
        'six-up',
    ];

    var nextItemId_ = 0; // use to generate an id, if none is provided
    var Item = Backbone.Model.extend({
        defaults: function() {
            var id = nextItemId_++;
            return {
                id: 'item' + id,
                label: 'Item' + id,
                active: false
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
    });

    var ItemView = Marionette.ItemView.extend({
        tagName: 'a',
        className: 'item',
        template: _.template(itemTemplate),
        attributes: function() {
            return {
                href: '#/' + this.model.id
            };
        },
        onBeforeRender: function() {
            this.$el.attr('data-state', this.model.isActive() ? 'active':'');
        }
    });

    var MenuView = Marionette.CollectionView.extend({
        childView: ItemView,
        tagName: 'div',
        initialize: function(options) {
            this.collection = new Backbone.Collection([], {
                model: Item
            });
            this.labelRight = options ? !!options.labelRight : false;
            this.listenTo(this.collection, 'change', this.render);
        },
        addItems: function(items) {
            this.collection.add(items);
            this.render();
        },
        onBeforeRender: function() {
            var classes = [ 'items' ];

            var count = this.collection.length;
            if (count > 0 && count < menuClasses.length) {
                classes.push(menuClasses[count]);
            }

            if (this.labelRight) {
                classes.push('label-right');
            }

            this.$el.removeClass();
            this.$el.addClass(classes.join(' '));
        },
        setActiveItem: function(id) {
            this.collection.each(function(item) {
                item.setActive(item.id === id);
            });
        }
    });

    return MenuView;
});
