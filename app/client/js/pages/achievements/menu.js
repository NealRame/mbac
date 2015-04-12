// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Apr  8 13:05:44 CEST 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var Achievement = require('pages/achievements/achievement');
    var MenuTemplate = require('text!pages/achievements/menu.html');
    var TagTemplate = require('text!pages/achievements/tag.html');

    var channel = Backbone.Wreqr.radio.channel('global');

    var Tag = Backbone.Model.extend({
        defaults: {
            checked: false,
            count: 0
        },
        inc: function() {
            this.set('count', this.get('count') + 1);
        },
        toggle: function() {
            this.set('checked', ! this.get('checked'));
        }
    });

    var TagCollection = Backbone.Collection.extend({
        model: Tag,
        update: function(achievement) {
            if (_.isArray(achievement)) {
                _.each(achievement, this.update, this);
            } else {
                _.each(achievement.tags(), function(tagname) {
                    var tag = this.add({id: tagname});
                    tag.inc();
                }, this);
            }
        }
    });

    var TagView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template(TagTemplate),
        ui: {
            checkbox: 'input'
        },
        events: {
            'change @ui.checkbox': 'onCheckboxChange'
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        onCheckboxChange: function(ev) {
            this.model.toggle();
        }
    });

    var TagListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: TagView,
        initialize: function() {
            this.collection = new TagCollection();
        }
    });

    var MenuView = Marionette.LayoutView.extend({
        tagName: 'ul',
        className: 'side-nav',
        serializeData: _.constant({}),
        template: _.template(MenuTemplate),
        regions: {
            filters: '#filters'
        },
        ui: {
            addAchievement: '#add-achievement',
            filterAchievement: '#filter-achievement',
        },
        events: {
            'click @ui.addAchievement': 'onAddAchievementClick',
            'click @ui.filterAchievement': 'onFilterAchievementClick'
        },
        initialize: function() {
            this.tagListView = new TagListView();
            this.listenToOnce(this.collection, 'sync', function() {
                this.tagListView.collection.update(this.collection.models);
            });
        },
        onAddAchievementClick: function(ev) {
            console.log('-- achievement::menu::onAddAchievementClick');
            ev.preventDefault();
            ev.stopPropagation();
            this.collection.add(new Achievement());
            return false;
        },
        onFilterAchievementClick: function(ev) {
            console.log('-- achievement::menu::onFilterAchievementClick');
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        },
        onShow: function() {
            this.showChildView('filters', this.tagListView);
        }
    });

    return MenuView;
});
