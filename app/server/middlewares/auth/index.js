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
            findUser(id, callback) {
                User.count({}).exec()
                    .then((count) => count === 0 ? User.create( {_id: id}) : User.findOne({_id: id}).exec())
                    .then(callback.bind(null, null))
                    .then(null, callback);
            },
            isInitialized(user, callback) {
                callback(null, user.isInitialized());
            },
            mapUser(user, oauth2_user, callback) {
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
