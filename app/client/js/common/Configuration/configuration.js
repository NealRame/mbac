// models/configuration.js
// -----------------------
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Sat Jan 10 15:05:32 CET 2015
define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');

    var Configuration = Backbone.Model.extend({
        initialize: function() {
            this.listenTo(this, 'change', function(model) {
                _.each(model.changedAttributes(), (function(value, key) {
                    if (! (value instanceof Configuration)) {
                        this.trigger('config', key, value);
                    }
                }).bind(this));
            });
        },
        set: function(path, value) {
            var super_set = Backbone.Model.prototype.set.bind(this);
            var config_ev_cb = function(key, path, value) {
                this.trigger('config', [key, path].join('.'), value);
            };

            if (_.isString(path)) {
                this.set(path.split('.'), value);
            } else if (_.isArray(path)) {
                if (path.length > 0) {
                    var key = path[0];
                    var val = this.get(key);

                    if (path.length > 1) {
                        // is old value an instance of a Configuration ?
                        if (! (val instanceof Configuration)) {
                            val = new Configuration();
                            this.listenTo(val, 'config', config_ev_cb.bind(this, key));
                        }
                        val.set(path.slice(1), value);
                    } else if (_.isObject(value)) {
                        // is old value an instance of a Configuration ?
                        if (val instanceof Configuration) {
                            val.destroy();
                            this.stopListening(val);
                        }
                        val = new Configuration();
                        this.listenTo(val, 'config', config_ev_cb.bind(this, key));
                        val.set(value);
                    } else {
                        val = value;
                    }

                    super_set(key, val);
                } else throw new Error('Invalid property path');
            } else if (_.isObject(path)) {
                _.each(path, (function(value, key) {
                    var val = this.get(key);

                    // is old value an instance of a Configuration ?
                    if (val instanceof Configuration) {
                        val.destroy();
                        this.stopListening(val);
                    }

                    if (_.isObject(value)) {
                        val = new Configuration();
                        this.listenTo(val, 'config', config_ev_cb.bind(this, key));
                        val.set(value);
                    } else {
                        val = value;
                    }

                    super_set(key, val);
                }).bind(this));
            } else {
                throw new TypeError('path must be a string or an array of strings');
            }
            return this;
        },
        get: function(path) {
            var super_get = Backbone.Model.prototype.get.bind(this);

            if (_.isString(path)) {
                return this.get(path.split('.'));
            } else if (_.isArray(path)) {
                switch (path.length) {
                    case 0: break;
                    case 1:
                        return super_get(path[0]);
                    default:
                        return super_get(path[0]).get(path.slice(1));
                }
            } else {
                throw new TypeError('path must be a string or an array of strings');
            }
        },
        toJSON: function() {
            var o = Backbone.Model.prototype.toJSON.call(this);
            _.each(o, function(value, key) {
                if (value instanceof Configuration) {
                    o[key] = value.toJSON();
                }
            });
            return o;
        },
        destroy: function() {
            _.each(this.attributes, (function(value, key) {
                if (value instanceof Configuration) {
                    this.stopListening(value);
                    value.destroy();
                }
            }).bind(this));
            Backbone.Model.prototype.destroy.call(this);
        }
    });

    return new Configuration();
});
