const express = require('express')
const router = express.Router()
const {requireLogin,checkDepartment} = require('../middlewares/auth.middleware')
const {getDepartment,
    postCreateNotification,
    getFeature,
    deleteNotification,
    putNotification
    }= require('../controllers/department.controller')
const upload = require('../config/multerConfig')
router.route('/')
    .get(requireLogin,checkDepartment,getDepartment)
router.route('/create-notification')
    .post(requireLogin,checkDepartment,upload.any('notification_files'),postCreateNotification)
router.route('/notification')
    .get(requireLogin,getFeature)
router.route('/delete-notification/:id')
    .delete(requireLogin,checkDepartment,deleteNotification)
router.route('/update-notification/:id')
    .put(requireLogin,checkDepartment,upload.any('notification_files-edit'),putNotification)
module.exports = router