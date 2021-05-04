const mongoose = require('mongoose')
const {Schema} = mongoose
const cloudinary = require('../config/cloudinaryConfig')
const notifycationSchema = new Schema({
    title : {
        type : String,
    },
    content : {
        type : String
    },
    category : {
        type : String
    },
    files : [
        {
            title : String,
            public_id : String
        }
    ], 
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
},{ timestamps: true })
notifycationSchema.pre('save',function(next) {
    next()
})
notifycationSchema.statics.createNotification = async function(title,content,category,filesList,author) {
    try {
        if(!title)
            return Promise.reject(Error('empty title'))
        if(!category)
            return Promise.reject(Error('empty category'))
        if(!content)
            return Promise.reject(Error('empty content'))
        const files = filesList.map(file => ({title : file.originalname,public_id : file.filename}))
        const results = await Promise.all(filesList.map(file => cloudinary.uploader
            .upload(file.path,{
                folder : 'notifications',
                public_id : file.filename,
                resource_type: "raw",
            })
        ))
        results.forEach(result => {
            const index = files.findIndex(file => result.public_id.includes(file.public_id))
            files[index].public_id = result.public_id
        })
        const notification = await this.create({title,content,category,files,author})
        return Promise.resolve(notification)
    } catch (error) {
        return Promise.reject(error.message)
    }
}
notifycationSchema.statics.updateNotification = async function(id,data) {
    try {
        const {title,category,content,isClearFiles,filesList} = data
        if(!title)
            return Promise.reject(Error('empty title'))
        if(!category)
            return Promise.reject(Error('empty category'))
        if(!content)
            return Promise.reject(Error('empty content'))
        if(filesList) {
            const thisNotif = await this.findById(id)
            const deleteFiles = thisNotif.files.map(file => file.public_id)
            if(deleteFiles.length) 
                await cloudinary.api.delete_resources(deleteFiles,{resource_type : 'raw'})
            const files = filesList.map(file => ({title : file.originalname,public_id : file.filename}))
            const results = await Promise.all(filesList.map(file => cloudinary.uploader
                .upload(file.path,{
                    folder : 'notifications',
                    public_id : file.filename,
                    resource_type: "raw",
                })
            ))
            results.forEach(result => {
                const index = files.findIndex(file => result.public_id.includes(file.public_id))
                files[index].public_id = result.public_id
            })
            const notification = await this.findByIdAndUpdate(id,{title,content,category,files},{new : true}).lean()
            return Promise.resolve(notification)
        }
        else {
            if(isClearFiles === 'true') {
                const thisNotif = await this.findById(id)
                const deleteFiles = thisNotif.files.map(file => file.public_id)
                if(deleteFiles.length) 
                    await cloudinary.api.delete_resources(deleteFiles,{resource_type : 'raw'})
                const notification = await this.findByIdAndUpdate(id,{title,content,category,files : []},{new : true}).lean()
                    return Promise.resolve(notification)
            } else {
                const notification = await this.findByIdAndUpdate(id,{title,content,category},{new : true}).lean()
                return Promise.resolve(notification)
            }
        }
    } catch (error) {
        return Promise.reject(error.message)
    }
}
module.exports = mongoose.model('notification',notifycationSchema)