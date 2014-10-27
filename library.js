(function(module) {
    "use strict";

    var User = module.parent.require('./user'),
        db = module.parent.require('../src/database'),
        meta = module.parent.require('./meta'),
        passport = module.parent.require('passport'),
        passportRenRen = require('passport-renren').Strategy,
        fs = module.parent.require('fs'),
        path = module.parent.require('path');

    var constants = Object.freeze({
        'name': "renren",
        'admin': {
            'icon': 'fa-renren',
            'route': '/renren'
        }
    });

    var RenRen = {};

    RenRen.getStrategy = function(strategies, callback) {
        if (meta.config['social:renren:id'] && meta.config['social:renren:secret']) {
            passport.use(new passportRenRen({
                clientID: meta.config['social:renren:id'],
                clientSecret: meta.config['social:renren:secret'],
                callbackURL: module.parent.require('nconf').get('url') + '/auth/renren/callback'
            },function(token, tokenSecret, profile, done) {



                var email = ''
                if(profile.emails && profile.emails.length){
                    email = profile.emails[0].value
                }
                var picture = '';
                if(profile._json.avatar[3].url){
                    picture = profile._json.avatar[3].url;
                }
                if(profile._json.avatar[2].url){
                    picture = profile._json.avatar[2].url;
                }
                if(profile._json.avatar[1].url){
                    picture = profile._json.avatar[1].url;
                }

                RenRen.login(profile.id, profile.name, email, picture, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    done(null, user);
                });
            }));

            strategies.push({
                name: 'renren',
                url: '/auth/renren',
                callbackURL: '/auth/renren/callback',
                icon: 'renren'
            });
        }

        callback(null, strategies);
    };

    RenRen.login = function(renrenID, username, email, picture, callback) {

        if (!email) {
            email = username + '@users.noreply.renren.com';
        }

        RenRen.getUidByRenrenID(renrenID, function(err, uid) {
            if (err) {
                return callback(err);
            }

            if (uid) {
                // Existing User
                callback(null, {
                    uid: uid
                });
            } else {
                // New User
                var success = function(uid) {
                    User.setUserField(uid, 'renrenid', renrenID);
                    User.setUserField(uid, 'picture', picture);
                    User.setUserField(uid, 'gravatarpicture', picture);
                    User.setUserField(uid, 'uploadedpicture', picture);
                    db.setObjectField('renrenid:renrenid', renrenID, uid);
                    callback(null, {
                        uid: uid
                    });
                };

                User.getUidByEmail(email, function(err, uid) {
                    if (!uid) {
                        User.create({username: username, email: email, picture:picture, uploadedpicture:picture}, function(err, uid) {
                            if (err !== null) {
                                callback(err);
                            } else {
                                success(uid);
                            }
                        });
                    } else {
                        success(uid); // Existing account -- merge
                    }
                });
            }
        });
    };

    RenRen.getUidByRenrenID = function(renrenID, callback) {
        db.getObjectField('renrenid:renrenid', renrenID, function(err, uid) {
            if (err) {
                callback(err);
            } else {
                callback(null, uid);
            }
        });
    };

    RenRen.addMenuItem = function(custom_header, callback) {
        custom_header.authentication.push({
            "route": constants.admin.route,
            "icon": constants.admin.icon,
            "name": constants.name
        });

        callback(null, custom_header);
    };

    function renderAdmin(req, res, callback) {
        res.render('sso/renren/admin', {});
    }

    RenRen.init = function(app, middleware, controllers) {
        app.get('/admin/renren', middleware.admin.buildHeader, renderAdmin);
        app.get('/api/admin/renren', renderAdmin);
    };

    module.exports = RenRen;
}(module));
