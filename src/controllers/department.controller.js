const Notification = require('../models/Notification.model')
const {handleCreateEditNotifErrors} = require('../helpers/handle-errors')
const APIFeatures = require('../helpers/handle-feature-api')
const cloudinary = require('../config/cloudinaryConfig')
const moment = require('moment')
require('moment/locale/vi')
moment.locale('vi')
module.exports.getDepartment = async (req,res) => {
    try {
        const {categories,id} = req.user
        const notifs = await Notification.find({author : id}).sort('-createdAt').limit(10).lean() // convert array of document model to array of plain object
        notifs.forEach(notif => notif.createdAt = moment(notif.createdAt).format('L'))
        const totalRows = await Notification.countDocuments({author : id})
        const totalPages = Math.ceil(totalRows/10)
        res.render('department',{categories,notifs,totalPages})
    } catch (error) {
        throw error
    }
}
module.exports.postCreateNotification = async (req,res) => {
    try {
        const io = req.app.get('socketio');
        const author = req.user.id
        const {title,content,category} = req.body
        const filesList = req.files || []
        const notification = await Notification.createNotification(title,content,category,filesList,author)
        res.status(200).json({notification})
        io.to('students').emit('new-notification',{id : notification._id,category,title})
    } catch (error) {
        const errors = handleCreateEditNotifErrors(error)
        res.status(400).json({errors})
    }
}
module.exports.getFeature = async (req,res) => {
    try {
        req.query.author = req.user.id
        const category = req.query.category
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const queryCount = {author : req.user.id,category}
        if(category === 'all') {
            delete req.query.category
            delete queryCount.category
        }
        const apiFeatures = new APIFeatures(Notification.find(),req.query).filter().sort().pagination()
        const notifs = await apiFeatures.query.lean() // convert array of document model to array of plain object
        notifs.forEach(notif => notif.createdAt = moment(notif.createdAt).format('L'))
        const totalRows = await Notification.countDocuments(queryCount)
        const totalPages = Math.ceil(totalRows/limit)
        res.status(200).json({notifs,pagination : {page,limit,totalPages,totalRows}})
    } catch (error) {
        res.status(400).json(error.message)
    }
}
module.exports.deleteNotification = async (req,res) => {
    try {
        const id = req.params.id 
        const isExist = await Notification.exists({_id :id})
        if(isExist) {
            const notif = await Notification.findByIdAndDelete(id)
            const files = notif.files.map(file => file.public_id)
            if(files.length) {
                const results = await cloudinary.api.delete_resources(files,{resource_type : 'raw'})
                res.status(200).json({notif,results})
            }
            else
                res.status(200).json({notif})
        }
        else {
            res.status(400).json({errors : 'Thông báo không tồn tại'})
        }
    } catch (error) {
        console.log(error)
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã thông báo không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.putNotification = async (req,res) => {
     try {
        const id = req.params.id
        const {title,category,content,isClearFiles} = req.body
        const filesList = req.files || []
        const data = {
            title,
            category,
            content,
            isClearFiles
        }
        if(filesList.length)
            data.filesList = filesList
        const notif = await Notification.updateNotification(id,data)
        notif.createdAt = moment(notif.createdAt).format('L')
        res.status(200).json({notif})
     } catch (error) {
        const errors = handleCreateEditNotifErrors(error)
        res.status(400).json({errors})
     }
}