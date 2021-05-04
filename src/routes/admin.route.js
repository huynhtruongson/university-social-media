const express = require('express')
const router = express.Router()
const {requireLogin,checkAdmin} = require('../middlewares/auth.middleware')
const {getAdmin,postCreateUser,getFeature}= require('../controllers/admin.controller')
router.route('/')
    .get(requireLogin,checkAdmin,getAdmin)
router.route('/create-user')
    .post(requireLogin,checkAdmin,postCreateUser)
router.route('/user')
    .get(getFeature)

module.exports = router