// Autocomplete list view.
// =======================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sat Feb 20 19:47:42 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var functional = require('common/functional');

    var AutocompleteItem = Marionette.ItemView.extend({
        attributes: function() {
            return {
                'data-item': this.model.get('item')
            }
        },
        triggers: {
            'click a': 'onItemClicked'
        },
        tagName: 'li',
        template: _.template('<a href="#"><%= item %></a>')
    });

    return Marionette.CollectionView.extend({
        childView: AutocompleteItem,
        className: 'autocomplete-list',
        tagName: 'ul',
        _next: function(incr) {
            if (functional.existy(this.index)) {
                var len = this.children.length;
                this.index = (this.index + incr + len)%len;
                this.children.each(function(item, index) {
                    if (index === this.index) {
                        item.$el.addClass('current');
                    } else {
                        item.$el.removeClass('current');
                    }
                });
            } else {
                this.children.findByIndex(0).$el.addClass('current');
            }
        },
        up: function() {
            this._next(-1);
        },
        down: function() {
            this._next( 1);
        }
    });
});
