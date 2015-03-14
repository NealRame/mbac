define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;

    var functional = require('utils/functional');

    var Achievement = require('Achievement');
    var AchievementEditorDialog = require('AchievementEditorDialog');
    var LightBox = require('LightBox');
    var Picture = require('Picture');
    var ThumbnailView = require('Thumbnail');
    var testTemplate = require('text!back/Test/test.html');

    var collection = new Backbone.Collection([{foo: 'foo'}]);

    var remote_pictures = new(Backbone.Collection.extend({
        url: '/api/pictures',
        model: Picture,
    }))();
    remote_pictures.fetch({
        reset: true
    });
    remote_pictures.on('reset', function() {
        collection.add(remote_pictures.models);
    });

    var achievements = new(Backbone.Collection.extend({
        url: '/api/achievements',
        model: Achievement,
    }))();
    achievements.fetch({
        reset: true
    });
    achievements.on('reset', function() {
        collection.add(achievements.models);
    });

    var PictureList = Marionette.CollectionView.extend({
        className: 'thumbnails',
        tagName: 'ul',
        childView: ThumbnailView,
        childViewOptions: {
            tagName: 'li',
            width: 196,
            height: 131,
        },
    });

    var Test = Marionette.LayoutView.extend({
        template: _.template(testTemplate),
        ui: {
            addAchievementButton: '#add-achievement',
            addPictureButton: '#add-picture'
        },
        events: {
            'click @ui.addAchievementButton': 'onAddAchievementButtonClicked',
            'click @ui.addPictureButton': 'onAddPictureButtonClicked'
        },
        initialize: function() {
            this.filesInput = $(document.createElement('input')).attr({
                accept: '.gif,.jpeg,.jpg,.png',
                multiple: '',
                type: 'file',
            });
            this.filesInput.on('change', (function(e) {
                this.addFiles(e.target.files);
            }).bind(this));
        },
        addFile: function(file) {
            if (file instanceof File && file.type.match(/^image\/.+$/)) {
                collection.add({
                    file: file
                });
            }
        },
        addFiles: function(files) {
            _.each(files, this.addFile, this);
        },
        onAddAchievementButtonClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            AchievementEditorDialog.open(new Achievement());
            return false;
        },
        onAddPictureButtonClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();

            this.filesInput.click();

            return false;
        },
        onShow: function() {
            if (!this.regions.content) {
                this.addRegion('content', '#test-content');
            }
            this.picturesList = new PictureList({
                collection: collection
            });
            this.listenTo(this.picturesList, 'childview:click', function(view) {
                var model = view.model;
                if (functional.hasAllOfAttributes(model, 'pictures')) {
                    console.log('pouet');
                    LightBox.open(model.pictures());
                }
            });
            this.getRegion('content').show(this.picturesList);
        }
    });

    return Test;
});
