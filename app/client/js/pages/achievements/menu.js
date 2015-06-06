// AchievementEditor/editor.js
// ---------------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Wed Apr  8 13:05:44 CEST 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var MenuTemplate = require('text!pages/achievements/menu.html');
    var TagTemplate = require('text!pages/achievements/tag.html');

    var app_channel = Backbone.Wreqr.radio.channel('achievements');

    var Tag = Backbone.Model.extend({
        defaults: {
            checked: false,
            count: 0
        },
        toggle: function() {
            this.set('checked', !this.get('checked'));
        }
    });

    var TagCollection = Backbone.Collection.extend({
        comparator: 'id',
        model: Tag,
        update: function(achievements) {
            var checked = this.checked();

            this.reset(_.chain(achievements)
                .map(function(achievement) {
                    return achievement.tags();
                })
                .flatten()
                .countBy(_.identity)
                .map(function(count, tag) {
                    return new Tag({
                        id: tag,
                        count: count,
                        checked: _.contains(checked, tag)
                    });
                })
                .value()
            );
        },
        checked: function() {
            return (
                _.chain(this.toJSON())
                    .where({checked: true})
                    .pluck('id')
                    .value()
            );
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
        onCheckboxChange: function() {
            this.model.toggle();
        }
    });

    var TagListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: TagView,
        initialize: function() {
            var visible = false;
            this.isVisible = function() {
                return visible;
            };
            this.setVisible = function(enabled) {
                if (visible !== enabled) {
                    if (enabled) {
                        this.$el.show();
                    } else {
                        this.$el.hide();
                    }
                    visible = enabled;
                }
            };
        },
        hide: function() {
            this.setVisible(false);
        },
        show: function() {
            this.setVisible(true);
        },
        toggle: function() {
            this.setVisible(!this.isVisible());
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
            filterAchievement: '#filter-achievement'
        },
        events: {
            'click @ui.addAchievement': 'onAddAchievementClick',
            'click @ui.filterAchievement': 'onFilterAchievementClick'
        },
        initialize: function() {
            this.tagList = new TagCollection();
            this.tagListView = new TagListView({collection: this.tagList});
            this.listenToOnce(this.collection, 'sync', function() {
                this.tagList.update(this.collection.models);
                this.listenTo(this.tagList, 'reset change:checked', function() {
                    app_channel.commands.execute('filter', this.tagList.checked());
                });
                this.listenTo(this.collection, 'add change:tags', function(model) {
                    if (!_.isEmpty(model.tags)) {
                        this.tagList.update(this.collection.models);
                    }
                });
            });
        },
        onAddAchievementClick: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            app_channel.commands.execute('create');
            return false;
        },
        onFilterAchievementClick: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            this.tagListView.toggle();
            app_channel.commands.execute(
                'filter',
                this.tagListView.isVisible() ? this.tagList.checked() : []
            );

            return false;
        },
        onShow: function() {
            this.showChildView('filters', this.tagListView);
        }
    });

    return MenuView;
});
