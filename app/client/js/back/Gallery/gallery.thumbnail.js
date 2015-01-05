define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');

    var thumbnailTemplate = require('text!back/Gallery/gallery.thumbnail.template.html');

    var Picture = Backbone.Model.extend({
        // setPicture: function(picture) {
        //     this.unset('original',  {silent: true});
        //     this.unset('thumbnail', {silent: true});
        //     this.unset('file',      {silent: true});
        //     this.set(picture);
        // },
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
            'actions': '.action-bar > a',
            'crop': '.crop'
        },
        events: {
            'click @ui.actions': 'onActionRequested',
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        getOption: Marionette.proxyGetOption,
        thumbnailTemplate: _.template(thumbnailTemplate),
        template: false,
        initialize: function(attr, options) {
            this.configure(
                _.extend(
                    options || {},
                    {
                        removable: true,
                        editable: true,
                        side: 128,
                        margin: 2,
                    }
                )
            );
        },
        configure: function(options, render) {
            this.options = _.extend(
                this.options || {},
                _.pick(options || {}, 'removable', 'editable', 'side', 'margin')
            );
            if (render) {
                this.render();
            }
            return this;
        },
        setPicture: function(picture) {
            this.model = picture;
            this.render();
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
            console.log(data);
            console.log(this);
            var data = {
                width:  this.options.side,
                height: this.options.side,
                actions: []
            };

            if (this.options.removable) {
                data.actions.push({
                    name: 'remove',
                    icon: 'fa fa-trash'
                });
            }
            if (this.options.editable) {
                data.actions.push({
                    name: 'edit',
                    icon: 'fa fa-pencil'
                });
            }
            this.$el.css('margin', this.options.margin).empty().html(this.thumbnailTemplate(data));
        },
        onRender: function() {
            var side = this.options.side;
            var create_overlay = function(type, font_size) {
                var classes = {
                    spinner: 'fa fa-circle-o-notch fa-spin',
                    placeholder: 'fa fa-ban fa-fw'
                };
                var shift = (side - font_size)/2;
                return $(document.createElement('i'))
                    .addClass((classes[type] || '') + ' ' + type)
                    .css({
                        fontSize: font_size,
                        height: font_size,
                        width: font_size,
                        left: shift,
                        top: shift
                    });
            };
            var create_spinner = create_overlay.bind(this, 'spinner', side/4);
            var create_placeholder = create_overlay.bind(this, 'placeholder', side - 32);
            var insert =
                (this.ui.crop.children().length > 0
                    ? function(elt){$(elt).insertBefore(this.$('.action-bar'));}
                    : function(elt){this.ui.crop.append(elt);}).bind(this);

            if (this.model) {
                var data = this.model.toJSON();
                var view = this;
                var img = new Image;

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
                    view.ui.crop.find('.spinner').remove();
                };

                insert(create_spinner());
                insert(img);

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
            } else {
                insert(create_placeholder());
            }
        }
    });

    return {
        model: Picture,
        view: Thumbnail
    };
});
