var Oauth2 = require('oauth2-js');
var User = require('models/user');

var oauth2;

exports.setup = function(app) {
    var auth_config;
    if (! oauth2 && (auth_config = app.get('config').auth)) {

        oauth2 = new Oauth2(auth_config, {
            findUser: function(id, callback) {
                User.count({}).exec()
                    .then(function(count) {
                        if (count === 0) {
                            User.create({ _id: id}, callback);
                        } else {
                            User.findById(id, callback);
                        }
                    })
                    .then(null, callback);
            },
            isInitialized: function(user, callback) {
                callback(null, user.isInitialized());
            },
            mapUser: function(user, oauth2_user, callback) {
                user.email = oauth2_user.email;
                user.name = {
                    first: oauth2_user.given_name,
                    last: oauth2_user.family_name
                };
                user.picture = oauth2_user.picture;
                user.save(callback);
            }
        });

        app.use(oauth2.middleware());
        app.use(oauth2.route());
    }
};
