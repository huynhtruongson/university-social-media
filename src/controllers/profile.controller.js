const User = require('../models/User.model')
const {handleUpdateProfileInfoErrors,handleUpdateProfilePasswordErrors} = require('../helpers/handle-errors')
const cloudinary = require('../config/cloudinaryConfig')
module.exports.getProfile = async (req,res) => {
    try {
        const {id} = req.params
        const user = await User.findById(id)
        if(user)
            res.render('profile',{user})
        else 
            res.send('User does not exist')
    } catch (error) {
        res.send('User does not exist')
    }
}
module.exports.getProfileAPI = async (req,res) => {
    try {
        const {id} = req.params
        const user = await User.findById(id)
        if(user)
            res.status(200).json({user})
        else 
            res.status(400).json({errors : 'Tài khoản không tồn tại'})
    } catch (error) {
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã thông báo không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.putUpdateProfileInfo = async (req,res) => {
    try {
        const {id} = req.user
        const {display_name,faculty,_class} = req.body
        const user = await User.updateProfileInfo(id,{display_name,faculty,_class})
        res.status(200).json({user})
    } catch (error) {
        const errors = handleUpdateProfileInfoErrors(error)
        res.status(400).json({errors})
    }
}
module.exports.putUpdateProfileAvatar = async (req,res) => {
    try {
        const avatar = req.file
        const {id} = req.user
        if(!avatar)
            res.status(400).json({errors : 'Please choose an image !'})
        else {
            const user = await User.findById(id)
            if(user) {
                if(user.avatar)
                    await cloudinary.uploader.destroy(user.avatar)
                const result = await cloudinary.uploader.upload(avatar.path,{folder : 'images'})
                const updatedUser = await User.findByIdAndUpdate(id,{avatar:result.public_id},{new:true})
                res.status(200).json({user : updatedUser})
            }
            else {
                res.status(400).json({errors : 'Tài khoản không tồn tại'})
            }
        }
    } catch (error) {
        console.log(error)
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã tài khoản không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.putUpdateProfilePassword = async (req,res) => {
    try {
        const {id} = req.user
        const {password,newPassword,reNewPassword} = req.body
        const user = await User.updateProfilePassword(id,password,newPassword,reNewPassword)
        res.status(200).json({user})
    } catch (error) {
        const errors = handleUpdateProfilePasswordErrors(error)
        res.status(400).json({errors})
    }
}