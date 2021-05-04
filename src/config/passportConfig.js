const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const passportConfig = () => {
    // passport.serializeUser(function (user, done) {
    //     done(null, user);
    // });

    // passport.deserializeUser(function (user, done) {
    //     done(null, user);
    // });
    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    '713987113089-2s1a0a5c6f4icpeg98j8aoom6fr0m9fp.apps.googleusercontent.com',
                clientSecret: 'VPqJCjG1-ZN9koxXaPT8WYbA',
                callbackURL: 'http://localhost:8080/auth/google/callback',
            },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    if (profile._json.hd !== 'student.tdtu.edu.vn') {
                        return cb(null, false);
                    }
                    const user = await User.findOneOrCreate({google_id : profile.id},profile._json);
                    return cb(null,user)
                } catch (error) {
                    cb(error,false)
                }
            },
        ),
    );
};

module.exports = passportConfig;
