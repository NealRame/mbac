'use strict';

/// auth.js
/// -------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date: Wed Jan 14 22:49:30 CET 2015
///
/// The function of the middleware _'auth'_ is to initialize authentication
/// related local variables and provide route to handle google oauth2
/// login and logout.

const Oauth2 = require('oauth2-js');
const User = require('models/user');

let oauth2;

exports.setup = function(app) {
    let auth_config;
    if (!oauth2 && (auth_config = app.get('config').auth)) {
        oauth2 = new Oauth2(auth_config, {
            find(id, callback) {
                User.count({}).exec()
                    .then((count) => count === 0 ? User.create( {_id: id}) : User.findOne({_id: id}).exec())
                    .then((user) => {
                        callback(null, user);
                    }, callback);
            },
            initialize(user, oauth2_user, callback) {
                user.email = oauth2_user.email;
                user.name = {
                    first: oauth2_user.given_name,
                    last: oauth2_user.family_name
                };
                user.picture = oauth2_user.picture;
                user.save((err, user) => callback(err, user));
            },
            isInitialized(user, callback) {
                callback(null, user.isInitialized());
            },
            id(user) {
                return user._id;
            }
        });
        app.use(oauth2.middleware);
        app.use(oauth2.route);
    }
};
