// Pictures container helper.
// ==========================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Fri Dec 25 16:44:52 CET 2015
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var functional = require('common/functional');
    var Picture = require('Picture');

    var create_model = functional.dispatch(
        functional.isa(Picture, 'original', 'thumbnail'),
        function(data) {
            if (!_.isUndefined(data)) {
                return new Backbone.Model(data);
            }
        }
    );

    return {
        picture: function(index) {
            return create_model(this.get('pictures')[index || 0]);
        },
        pictures: function() {
            return _.map(this.get('pictures'), function(data) {
                return create_model(data);
            });
        },
        setPictures: function(pictures) {
            return this.set('pictures', pictures);
        },
        addPicture: function(picture) {
            var list = this.get('pictures').slice(0);
            if (!_.contains(list, picture)) {
                var index = list.length;
                list.push(picture);
                this.set({pictures: list});
                this.trigger('new-picture', picture, index);
                return list[index];
            }
        },
        removePicture: function(index) {
            var list = this.get('pictures').slice(0);
            if (index < list.length) {
                list.splice(index, 1);
                this.set({pictures: list});
                return true;
            }
            return false;
        }
    };
});
