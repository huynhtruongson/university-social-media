const express = require('express')
const router = express.Router()
const {requireLogin} = require('../middlewares/auth.middleware')
const {getNotifications,getDetailNotifAPI,getFeature,getDetailNotif}= require('../controllers/notification.controller')
router.route('/')
    .get(requireLogin,getNotifications)
router.route('/feature')
    .get(getFeature)
router.route('/api/:id')
    .get(getDetailNotifAPI)
router.route('/:id')
    .get(requireLogin,getDetailNotif)
module.exports = router