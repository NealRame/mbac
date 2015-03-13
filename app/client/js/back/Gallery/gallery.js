// models/achievement.js
// ---------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Jan  2 23:23:59 CET 2015
define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var configuration = require('Configuration');

    var Achievement = require('Achievement');
    var AchievementEditorDialog = require('AchievementEditorDialog');
    var Dialog = require('Dialog');
    var Thumbnail = require('Thumbnail');

    var editorTemplate  = require('text!back/Gallery/editor.html');
    var galleryTemplate = require('text!back/Gallery/gallery.html');
    var listAddTemplate = require('text!back/Gallery/list-add.template.html');

    var AchievementList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        editable: false,
        thumbnailHeight: 131,
        thumbnailWidth: 196,
        childView: Thumbnail.Achievement,
        childViewOptions: function() {
            return {
                tagName: 'li',
                width: Marionette.getOption(this, 'thumbnailWidth'),
                height: Marionette.getOption(this, 'thumbnailHeight'),
                removable: Marionette.getOption(this, 'editable'),
                editable: Marionette.getOption(this, 'editable'),
            };
        },
        filter: function(tags) {
            this.children.each(function(child) {
                if (tags.length === 0 || child.model.hasTags(tags)) {
                    child.$el.fadeIn('fast');
                } else {
                    child.$el.fadeOut('fast');
                }
            });
        },
        onChildEdit: function(view, model) {
            console.log('-- AchievementList: edit request');
            console.log(view);
            console.log(model);

        },
        onChildRemove: function(view, model) {
            console.log('-- AchievementList: remove request');
            console.log(view);
            console.log(model);
        }
    });


    var Gallery = Marionette.LayoutView.extend({
        template: _.template(galleryTemplate),
        regions: {
            achievementList: '#achievement-list'
        },
        ui: {
            addButton: '#add-achievement',
            filterButton: '#filter-achievement',
            filters: '#filters'
        },
        events: {
            'click @ui.addButton': 'onAddButtonClicked',
            'click @ui.filterButton': 'onFilterButtonClicked',
            'change #filters input': 'onFiltersChanged'
        },
        filterTemplate: _.template(
            '<input id="<%= tag %>" type="checkbox">'
            + '<label for="<%= tag %>"><%= tag %></label>'
        ),
        initialize: function() {
            console.log('-- Gallery:initialize');
            this.collection = new (Backbone.Collection.extend({
                model: Achievement,
                url: '/api/achievements'
            }))();
            this.achievementList = new AchievementList({
                collection: this.collection,
                editable: true
            });

            this.listenTo(this.achievementList, 'childview:edit', function(view, achievement) {
                this.openEditor(achievement);
            });
            this.listenTo(this.achievementList, 'childview:remove', function(view, achievement) {
                this.achievement.destroy();
            });

            this.listenTo(this.collection, 'add', this.openEditor);
            this.listenTo(this.collection, 'change remove reset', function() {
                this.populateFilters();
            });
            this.collection.fetch({reset: true});
        },
        populateFilters: function() {
            var filters = this.ui.filters;
            filters.empty();
            this.collection.chain()
                .reduce(function(memo, model) {
                    return memo.concat(model.tags());
                }, []).uniq().each(function(tag) {
                    filters.append(
                        $(document.createElement('li'))
                            .html(this.filterTemplate({tag: tag}))
                    );
                }, this);
            this.updateFilter();
        },
        onAddButtonClicked: function(e) {
            console.log('-- Gallery:onAddButtonClicked');
            e.preventDefault();
            e.stopPropagation();
            this.collection.add(new Achievement());
            return false;
        },
        onFilterButtonClicked: function(e) {
            console.log('-- Gallery:onFiltersButtonClicked');
            e.preventDefault();
            e.stopPropagation();
            if (this.ui.filterButton.attr('data-state') === 'enabled') {
                this.ui.filterButton.attr('data-state', 'disabled');
                this.ui.filters.hide();
            } else {
                this.ui.filterButton.attr('data-state', 'enabled');
                this.ui.filters.show();
            }
            this.updateFilter();
            return false;
        },
        onFiltersChanged: function(e) {
            console.log('-- Gallery:onFiltersChanged');
            this.updateFilter();
            return false;
        },
        updateFilter: function() {
            var tags = [];
            if (this.ui.filterButton.attr('data-state') === 'enabled') {
                tags = this.ui.filters.find('input:checked').map(
                    function(){return this.id;}
                ).get();
            }
            this.achievementList.filter(tags);
        },
        openEditor: function(achievement) {
            console.log('-- Gallery:openEditor');
            AchievementEditorDialog.open(achievement);
        },
        onRender: function() {
            console.log('-- Gallery:onRender');
            this.getRegion('achievementList').show(this.achievementList);
            this.ui.filterButton.attr('data-state', 'disabled');
        }
    });

    return Gallery;
});
