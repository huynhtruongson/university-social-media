const Notification = require('../models/Notification.model')
const Category = require('../models/Category.model')
const APIFeatures = require('../helpers/handle-feature-api')
const moment = require('moment')
require('moment/locale/vi')
moment.locale('vi')
module.exports.getNotifications = async (req,res) => {
    try {
        if(req.query.category) {
            const {category} = req.query
            const notifs = await Notification.find({category}).sort('-createdAt').limit(10).lean() // convert array of document model to array of plain object
            notifs.forEach(notif => notif.createdAt = moment(notif.createdAt).format('L'))
            const totalRows = await Notification.countDocuments({category})
            const totalPages = Math.ceil(totalRows/10)
            res.render('notification',{category,notifs,totalPages})
        }
        else {
            const notifs = await Notification.find().sort('-createdAt').limit(10).lean() // convert array of document model to array of plain object
            notifs.forEach(notif => notif.createdAt = moment(notif.createdAt).format('L'))
            const totalRows = await Notification.countDocuments()
            const totalPages = Math.ceil(totalRows/10)
            let categories = await Category.find()
            categories = categories.map(category => category.title)
            res.render('notification',{categories,notifs,totalPages})
        }
    } catch (error) {
        throw error
    }
}
module.exports.getFeature = async (req,res) => {
    try {
        const category = req.query.category
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const queryCount = {category}
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
module.exports.getDetailNotifAPI = async (req,res) => {
    try {
        const id = req.params.id
        const notif = await Notification.findById(id)
        if(notif)
            res.status(200).json({notif})
        else 
            res.status(400).json({errors : 'Thông báo không tồn tại'})

    } catch (error) {
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã thông báo không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.getDetailNotif = async (req,res) => {
    try {
        const id = req.params.id
        let notif = await Notification.findById(id).lean()
        if(notif) {
            notif.createdAt = moment(notif.createdAt).format('L')
            res.render('detail-notif',{notif})
        }
        else 
            res.render('detail-notif')

    } catch (error) {
        res.render('detail-notif')
    }
}