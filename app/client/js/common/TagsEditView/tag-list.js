// TagList.
// =============
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Thu Feb 18 23:49:44 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');

    var TagView = Marionette.ItemView.extend({
        attributes: function() {
            return {
                'data-tag': this.model.get('tag')
            }
        },
        ui: {
            removeButton: 'a'
        },
        events: {
            'click @ui.removeButton': 'onRemoveButtonClicked'
        },
        tagName: 'li',
        template: _.template('<a class="remove" href="#"></a>'),
        onRemoveButtonClicked: function(ev) {
            this.model.destroy();
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
    });

    return Marionette.CollectionView.extend({
        childView: TagView,
        className: 'tag-list',
        tagName: 'ul'
    });
});
