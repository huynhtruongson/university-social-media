const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User.model');
const {handleLoginErrors} = require('../helpers/handle-errors');
const maxAge = 24 * 60 * 60; // 1 day in second
module.exports.getLogin = (req, res) => {
    const {failed} = req.query
    res.render('login',{failed});
};
module.exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.login(username, password); // User.login return promise
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: maxAge,
        });
        res.cookie('token', token, { maxAge: maxAge * 1000 }); // 1 day in milisecond
        res.status(200).json({ id: user._id,token});
    } catch (error) {
        const errors = handleLoginErrors(error);
        res.status(400).json({ errors });
    }
};
module.exports.getGoogleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});
module.exports.getGoogleCallback = (req, res, next) => {
    passport.authenticate('google', function (err, user) {
        if (err) {
            console.log(err.message);
            return res.redirect('/auth/login');
        }
        if (!user)
            return res.redirect('/auth/login?failed=true');
        // req.logIn(user, function (err) {
        //     if (err) 
        //         next(err);
        //     res.redirect('/');
        // });
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: maxAge,
        });
        res.cookie('token', token, { maxAge: maxAge * 1000 });
        return res.redirect('/')
    })(req, res, next);
};
module.exports.logout = (req,res) => {
    res.cookie('token','',{maxAge : 1})
    res.redirect('/auth/login')
}