define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
	var PictureList = require('PictureList');
    var AchievementBase = require('pages/achievements/common/models/achievement');

    var async = require('common/async');
    var marked = require('marked');
    var ui = require('common/ui');

    var Achievement = AchievementBase.extend({
        urlRoot: '/api/achievements/'
    });

    function current_achievement_id() {
        return _.last(window.location.pathname.split('/'));
    }

    var Layout = Marionette.LayoutView.extend({
        regions: {
            'pictures-list': '#pictures-wrapper'
        },
        childEvents: {
            'thumbnail-list:ready': function() {
                ui.pushDown($('body > footer').first(), window, 0);
            }
        },
        ui: {
            description: '#description-wrapper'
        },
        template: false,
        onRender: function() {
            var region = this.getRegion('pictures-list');
            region.$el.empty().show();
            region.show(new PictureList({
				collection: new Backbone.Collection(this.model.pictures()),
				editable: false
			}));
            this.ui.description
                .empty()
                .html(marked(this.model.description(), {headerPrefix: '__'}))
                .show();
        }
    });

    async.fetchModel(new Achievement({
        _id: current_achievement_id()
    })).then(function(achievement) {
        var layout = new Layout({
            el: $('body'),
            model: achievement
        });
        layout.render();
    }).catch(function(err) {
        console.error(err);
    });
});
