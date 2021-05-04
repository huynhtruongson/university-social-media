const express = require('express')
const router = express.Router()
const {getHome} = require('../controllers/home.controller')
const {requireLogin} = require('../middlewares/auth.middleware')
router.route('/')
    .get(requireLogin,getHome)

module.exports = router