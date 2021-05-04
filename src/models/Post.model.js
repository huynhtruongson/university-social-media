const mongoose = require('mongoose')
const {Schema} = mongoose
const cloudinary = require('../config/cloudinaryConfig')
const postSchema = new Schema({
    status : {
        type : String,
    },
    images : [String],
    videos : [String],
    likes : [{
        type : Schema.Types.ObjectId,
        ref : 'user'
    }],
    comments : [
        {
            author : {
                type : Schema.Types.ObjectId,
                ref : 'user'
            },
            content : String
        }
    ], 
    author : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
},{ timestamps: true })


module.exports = mongoose.model('post',postSchema)