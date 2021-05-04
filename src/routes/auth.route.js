const express = require('express')
const router = express.Router()
const {getLogin,postLogin,getGoogleLogin,getGoogleCallback,logout} =require('../controllers/auth.controller')
const {checkUser} = require('../middlewares/auth.middleware')
router.route('/login')
    .get(checkUser,getLogin)
    .post(checkUser,postLogin)

router.route('/google')
    .get(checkUser,getGoogleLogin)

router.route('/google/callback')
    .get(checkUser,getGoogleCallback)
router.route('/logout')
    .get(logout)
module.exports = router