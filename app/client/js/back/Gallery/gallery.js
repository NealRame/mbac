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
    var Dialog = require('Dialog');
    var Thumbnail = require('back/Gallery/thumbnail');

    var editorTemplate  = require('text!back/Gallery/editor.html');
    var galleryTemplate = require('text!back/Gallery/gallery.html');
    var listAddTemplate = require('text!back/Gallery/list-add.template.html');


    if (_.indexOf($.event.props, 'dataTransfer') < 0) {
        $.event.props.push('dataTransfer');
    }

    var AddItemButton = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'thumb',
        attributes: {
            'data-last': ''
        },
        ui: {
            addButton: '#add-achievement'
        },
        triggers: {
            'click @ui.addButton': 'click'
        },
        title: '',
        initialize: function() {
            this.model = configuration.get('gallery.thumbnail');
            this.template = (function(data) {
                if (_.isString(listAddTemplate)) {
                    listAddTemplate =
                    _.template(listAddTemplate);
                }

                var w = data.width, h = data.height;
                var font_size = Math.max(8, Math.min(w, h) - 32);

                return listAddTemplate({
                    width: w,
                    height: h,
                    fontSize: font_size,
                    left: (w - font_size)/2,
                    top: (h - font_size)/2,
                    title: Marionette.getOption(this, 'title')
                });
            }).bind(this);
        },
        onRender: function() {
            this.$el.css({margin: this.model.get('margin')});
        }
    });


    var AchievementPictureList = Marionette.CollectionView.extend({
        childView: Thumbnail.view,
        events: {
            'dragenter': 'onDragEnter',
            'dragleave': 'onDragLeave',
            'dragover':  'onDragOver',
            'drop':      'onDrop'
        },
        initialize: function() {
            this.configuration = configuration.get('gallery.thumbnail');
            this.listenTo(this.collection, 'remove', function(model, col, opt) {
                this.trigger('remove-picture', model.attributes, opt.index);
            });
            this.filesInput = $(document.createElement('input')).attr({
                type: 'file', multiple: ''
            });
            this.filesInput.on('change', (function(e) {
                this.addFiles(e.target.files);
            }).bind(this));
        },
        addChild: function(child, ChildView, index) {
            var thumbnail = new ChildView({
                tagName: 'li',
                model: child
            }).configure(_.extend(this.configuration.toJSON(), {editable: true}));
            this.$el.append(thumbnail.render().el);
            this.listenTo(thumbnail, 'remove', function() {
                console.log('-- AchievementPictureList: remove');
                this.stopListening(thumbnail);
                child.destroy();
                thumbnail.remove();
            });
        },
        addFile: function(file) {
            if (file instanceof File) {
                var picture = {file: file};
                var index = this.collection.length;
                this.collection.add(picture);
                this.trigger('add-picture', picture, index);
            }
        },
        addFiles: function(files) {
            _.each(files, this.addFile, this);
        },
        onDragEnter: function(e) {
            console.log('-- AchievementPictureList:onDragEnter');
            e.preventDefault();
            e.stopPropagation();
            this.$el.attr('data-state', 'over');
            return false;
        },
        onDragLeave: function(e) {
            console.log('-- AchievementPictureList:onDragLeave');
            e.preventDefault();
            e.stopPropagation();
            this.$el.removeAttr('data-state');
            return false;
        },
        onDragOver: function(e) {
            console.log('-- AchievementPictureList:onDragOver');
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        onDrop: function(e) {
            console.log('-- AchievementPictureList:onDrop');
            this.onDragLeave.call(this, e);
            this.addFiles(e.dataTransfer.files);
            return false;
        },
        onBeforeRender: function() {
            if (! this.addPictureButton) {
                this.addPictureButton = new AddItemButton({title: 'Ajouter une image'});
                this.$el.append(this.addPictureButton.render().el);
                this.listenTo(this.addPictureButton, 'click', function() {
                    this.filesInput.click();
                });
            }
        }
    });


    var AchievementEditor = Marionette.ItemView.extend({
        className: 'achievement-editor',
        ui: {
            descField: '#desc',
            nameField: '#name',
            tagsField: '#tags',
            publish:   '#publish'
        },
        events: {
            'blur   @ui.descField': 'onDescriptionChanged',
            'blur   @ui.nameField': 'onNameChanged',
            'blur   @ui.tagsField': 'onTagsChanged',
            'click  @ui.publish': 'onPublishClick'
        },
        template: _.template(editorTemplate),

        onDescriptionChanged: function() {
            console.log('-- AchievementEditor:onDescriptionChanged');
            this.model.set('description', this.ui.descField.val());
            return false;
        },
        onNameChanged: function() {
            console.log('-- AchievementEditor:onNameChanged');
            this.model.set('name', this.ui.nameField.val().trim());
            return false;
        },
        onTagsChanged: function() {
            console.log('-- AchievementEditor:onTagsChanged');
            this.model.setTags(this.ui.tagsField.val().split(','));
            this.ui.tagsField.val(this.model.tags().join(', '));
            return false;
        },
        onPublishClick: function(e) {
            console.log('-- AchievementEditor:onPublishClick');

            e.preventDefault();
            e.stopPropagation();

            this.ui.publish.removeClass();

            if (this.model.togglePublish().published()) {
                this.ui.publish.addClass('unpublish-button');
            } else {
                this.ui.publish.addClass('publish-button');
            }

            return false;
        },
        onRender: function() {
            this.ui.nameField.val(this.model.get('name'));
            this.ui.descField.val(this.model.get('description'));
            this.ui.tagsField.val(this.model.tags().join(', '));
            this.ui.publish.addClass(
                this.model.published() ? 'unpublish-button':'publish-button'
            );
            this.achievementPictureList = new AchievementPictureList({
                el: this.$('#pictures'),
                collection: new Backbone.Collection(
                    this.model.get('pictures'), {model: Thumbnail.model}
                )
            });
            this.listenTo(
                this.achievementPictureList,
                'add-picture',
                function(picture, index) {
                    console.log('add-picture: ', picture, index);
                    this.model.addPicture(picture);
                }
            );
            this.listenTo(
                this.achievementPictureList,
                'remove-picture',
                function(picture, index) {
                    console.log('remove-picture: ', picture, index);
                    this.model.removePicture(index);
                }
            );
            this.achievementPictureList.render();
        }
    });


    var AchievementEditorDialog = Dialog.extend({
        initialize: function() {
            this.options.accept = this.model.isNew() ? 'Ajouter':'Modifier';
            this.options.refuse = 'Annuler';
            Dialog.prototype.initialize.call(this);
        },
        accept: function() {
            console.log('-- AchievementEditorDialog:onAcceptClicked');

            var commit = (function() {
                this.model.set(this.getContent().currentView.model.toJSON());
                this.model.save();
                this.close();
            }).bind(this);

            if (! this.model.isNew()) {
                var editor = this;
                Dialog.createMessageBox(
                    'Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Continuer',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Annuler',
                    }
                ).run();
            } else commit();
        },
        refuse: function() {
            console.log('-- AchievementEditorDialog:onCancelClicked');

            var commit = (function() {
                if (this.model.isNew()) {
                    this.model.destroy();
                }
                this.close();
            }).bind(this);

            if (this.getContent().currentView.model.hasChanged()) {
                var editor = this;
                Dialog.createMessageBox(
                    'Les modifications apportées seront perdues! Êtes vous sûr de vouloir continuer ?',
                    {
                        accept: commit,
                        acceptLabel: 'Oui',
                        refuse: editor.open.bind(editor),
                        refuseLabel: 'Non'
                    }
                ).run();
            } else commit();

            return false;
        },
        setContent: function(region) {
            region.show(new AchievementEditor({
                model: this.model.clone()
            }));
        }
    });


    var AchievementList = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'thumbnails',
        childView: Thumbnail.view,
        initialize: function() {
            this.configuration = configuration.get('gallery');
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
        addChild: function(child, ChildView) {
            var thumbnail = new ChildView({
                tagName: 'li',
                model: child
            }).configure(this.configuration.get('thumbnail').toJSON());

            this.children.add(thumbnail);

            this.listenTo(child, 'destroy', function() {
                console.log('-- AchievementView: remove');
                this.stopListening(thumbnail);
                thumbnail.remove();
            });
            this.listenTo(thumbnail, 'remove', function() {
                console.log('-- AchievementView: remove');
                child.destroy();
            });
            this.listenTo(thumbnail, 'edit', function() {
                console.log('-- AchievementView: edit');
                this.trigger('edit', child);
            });

            var $child = thumbnail.render().$el;

            if (this.$el.children().length > 0) {
                $child.insertBefore(this.$el.children().first());
            } else {
                this.$el.append($child);
            }
        },
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
                collection: this.collection
            });

            this.listenTo(this.achievementList, 'edit', this.openEditor);
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
            (new AchievementEditorDialog({model: achievement})).run();
        },
        onRender: function() {
            console.log('-- Gallery:onRender');
            this.getRegion('achievementList').show(this.achievementList);
            this.ui.filterButton.attr('data-state', 'disabled');
        }
    });

    return Gallery;
});
