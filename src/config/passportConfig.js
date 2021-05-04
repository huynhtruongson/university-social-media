require('dotenv').config()
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
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: 'https://university-social-media.herokuapp.com/auth/google/callback',
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
