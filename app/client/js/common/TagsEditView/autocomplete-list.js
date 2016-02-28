// Autocomplete list view.
// =======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sat Feb 20 19:47:42 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var functional = require('common/functional');

    var KEY_UP = 38;

    var AutocompleteItem = Marionette.ItemView.extend({
        attributes: function() {
            return {
                'data-item': this.model.get('item')
            }
        },
        triggers: {
            'click a': 'clicked'
        },
        tagName: 'li',
        template: _.template('<a href="#"><%= item %></a>')
    });

    return Marionette.CollectionView.extend({
        childView: AutocompleteItem,
        childEvents: {
            'clicked': 'onItemClicked'
        },
        className: 'autocomplete-list',
        tagName: 'ul',
        next: function(key) {
            var incr = key === KEY_UP ? -1 : 1;
            if (functional.existy(this.index)) {
                var len = this.children.length;
                this.index = (this.index + incr + len)%len;
                this.children.each(function(item, index) {
                    if (index === this.index) {
                        item.$el.addClass('current');
                    } else {
                        item.$el.removeClass('current');
                    }
                }, this);
            } else {
                this.index = 0;
                this.children.findByIndex(0).$el.addClass('current');
            }
            return this.$('.current').get(0).dataset.item;
        },
        onItemClicked: function(item) {
            this.triggerMethod('autocomplete:item:clicked', item.model.get('item'));
        }
    });
});
