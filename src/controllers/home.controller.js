const User = require('../models/User.model')
const Notification = require('../models/Notification.model')
const moment = require('moment')
require('moment/locale/vi')
moment.locale('vi')
module.exports.getHome = async (req,res) => {
    try {
        const {id} = req.user
        const user = await User.findById(id)
        const notifs = await Notification.find().sort('-createdAt').limit(5).lean() // convert array of document model to array of plain object
        notifs.forEach(notif => notif.createdAt = moment(notif.createdAt).format('L'))
        res.render('home',{user,notifs})
    } catch (error) {
        res.send('User does not exist')
    }
}