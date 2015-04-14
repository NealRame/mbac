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

    var app_channel = Backbone.Wreqr.radio.channel('achievements');

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
        comparator: 'id',
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
        onCheckboxChange: function(ev) {
            this.model.toggle();
        }
    });

    var TagListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: TagView,
        initialize: function() {
            this._visible = false;
        },
        isVisible: function() {
            return this._visible;
        },
        hide: function() {
            if (this._visible) {
                this.$el.hide();
            }
            this._visible = false;
        },
        show: function() {
            if (! this._visible) {
                this.$el.show();
            }
            this._visible = true;
        },
        toggle: function() {
            this.isVisible() ? this.hide() : this.show();
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
            this.tagList = new TagCollection();
            this.tagListView = new TagListView({collection: this.tagList});
            this.listenToOnce(this.collection, 'sync', function() {
                this.tagList.update(this.collection.models);
            });
            this.listenTo(this.tagList, 'change:checked', function() {
                app_channel.commands.execute('filter', this.tagList.checked());
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
