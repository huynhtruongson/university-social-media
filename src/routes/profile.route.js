const express = require('express')
const router = express.Router()
const {requireLogin} = require('../middlewares/auth.middleware')
const upload = require('../config/multerConfig')
const {
    getProfile,
    getProfileAPI,
    putUpdateProfileInfo,
    putUpdateProfileAvatar,
    putUpdateProfilePassword
}= require('../controllers/profile.controller')
router.route('/:id')
    .get(requireLogin,getProfile)
router.route('/api/:id')
    .get(getProfileAPI)
router.route('/update-info')
    .put(requireLogin,putUpdateProfileInfo)
router.route('/update-avatar')
    .put(requireLogin,upload.single('avatar'),putUpdateProfileAvatar)
router.route('/update-password')
    .put(requireLogin,putUpdateProfilePassword)
module.exports = router