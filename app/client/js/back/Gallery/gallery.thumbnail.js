define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');


    var Picture = Backbone.Model.extend({
        setPicture: function(picture) {
            this.unset('original',  {silent: true});
            this.unset('thumbnail', {silent: true});
            this.unset('file',      {silent: true});
            this.set(picture);
        },
        validate: function(attributes) {
            if (! (attributes.file instanceof File)
                    || (attributes.thumbnail instanceof String
                            && attributes.original instanceof String)) {
                return new Error('invalid thumbnail data');
            }
        }
    });


    var Thumbnail = Marionette.ItemView.extend({
        className: 'thumb',
        ui: {
            'actions': '.action-bar > a'
        },
        events: {
            'click @ui.actions': 'onActionRequested',
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        getOption: Marionette.proxyGetOption,
        template: false,
        initialize: function(attr, options) {
            this.configure(
                _.extend(
                    options || {},
                    {
                        removable: true,
                        editable: true,
                        side: 128,
                    }
                )
            );
        },
        configure: function(options, render) {
            this.options = _.extend(
                this.options || {},
                _.pick(options || {}, 'removable', 'editable', 'side')
            );
            if (render) {
                this.render();
            }
            return this;
        },
        onActionRequested: function(e) {
            e.preventDefault();
            this.trigger($(e.currentTarget).attr('data-action'), this.model);
            return false;
        },
        onMouseEnter: function(e) {
            this.$('.action-bar').fadeIn(100);
            return false;
        },
        onMouseLeave: function(e) {
            this.$('.action-bar').fadeOut(100);
            return false;
        },
        onBeforeRender: function() {
            var side = this.options.side;

            var create_spinner = (function() {
                var fontSize = side/4;
                var shift = 3*fontSize/2;

                return $(document.createElement('i'))
                    .addClass('fa fa-circle-o-notch fa-spin spinner')
                    .css({
                        position: 'absolute',
                        fontSize: fontSize,
                        height: fontSize,
                        width: fontSize,
                        left: shift,
                        top:  shift
                    });
            }).bind(this);

            var create_placeholder = (function() {
                var fontSize = side - 32;
                var shift = (side - fontSize)/2;

                return $(document.createElement('i'))
                    .addClass('fa fa-ban fa-fw')
                    .css({
                        color: 'lightgray',
                        position: 'absolute',
                        fontSize: fontSize,
                        height: fontSize,
                        width: fontSize,
                        left: shift,
                        top:  shift
                    });
            }).bind(this);

            var create_action_bar = (function() {
                var actions = [];
                if (this.options.removable) {
                    actions.push(
                        $(document.createElement('a'))
                            .attr('href', '#')
                            .attr('data-action', 'remove')
                            .append($(document.createElement('i')).addClass('fa fa-trash'))
                    );
                }
                if (this.options.editable) {
                    actions.push(
                        $(document.createElement('a'))
                            .attr('href', '#')
                            .attr('data-action', 'edit')
                            .append($(document.createElement('i')).addClass('fa fa-pencil'))
                    );
                }
                return $(document.createElement('div')).addClass('action-bar').append(actions);
            }).bind(this);

            var create_thumb = (function(cb) {
                if (! this.model) {
                    var elt = create_placeholder();
                    if (cb) {
                        cb.call(this, elt);
                    }
                    return elt;
                }

                var data = this.model.toJSON();
                var view = this;
                var img = new Image;

                var wrapper =
                    $(document.createElement('div'))
                        .css({width: side, height: side})
                        .append([img, create_spinner(), create_action_bar()]);

                img.onload = function() {
                    var w = img.width, h = img.height, r = w/h;

                    if (r > 1) {
                        w = side*r;
                        $(img).css({
                            left: (side - w)/2,
                            width: w,
                            height: side,
                        });
                    } else {
                        h = side/r;
                        $(img).css({
                            top: (side - h)/2,
                            width: side,
                            height: h
                        });
                    }

                    wrapper.find('.spinner').remove();

                    if (cb) {
                        cb.call(view, wrapper);
                    }
                };

                if (data.file instanceof File) {
                    var reader = new FileReader;
                    reader.onload = (function(e) {
                        img.src = e.target.result;
                    });
                    reader.readAsDataURL(data.file);
                } else {
                    // img.src = 'files/' + data.thumbnail;
                    img.src = data.thumbnail;
                }

                return wrapper;
            }).bind(this);

            create_thumb(function(thumb) {
                this.$el.empty().append(thumb);
            });

            return this;
        }
    });

    return {
        model: Picture,
        view: Thumbnail
    };
});
