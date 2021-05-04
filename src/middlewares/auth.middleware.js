const User = require('../models/User.model');
const Category = require('../models/Category.model')
const jwt = require('jsonwebtoken');
module.exports.requireLogin = (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, data) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                res.redirect('/auth/login');
            } else {
                try {
                    const user = await User.findById(data.id).select('-password');
                    if (user) {
                        res.locals.currentUser = user
                        req.user = { id: user._id, role: user.role,categories : user.categories };
                        const categories = await Category.find()
                        const categoryList = {}
                        categoryList.department = categories
                            .filter(category => category.type === 'department')
                            .map(category => category.title)
                        categoryList.faculty = categories
                            .filter(category => category.type === 'faculty')
                            .map(category => category.title)
                        res.locals.categoryList = categoryList
                        next();
                    } else {
                        res.redirect('/auth/login');
                    }
                } catch (error) {
                    throw error.message;
                }
            }
        });
    } else res.redirect('/auth/login');
};
module.exports.checkUser = (req, res, next) => {
    const { token } = req.cookies;
    if (token) res.redirect('/');
    else next();
};
module.exports.checkAdmin = (req, res, next) => {
    const user = req.user;
    if (user.role === 2) next();
    else res.render('404-page');
};
module.exports.checkDepartment = (req, res, next) => {
    const user = req.user;
    if (user.role >= 1) next();
    else res.render('404-page');
};
