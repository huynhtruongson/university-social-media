const mongoose = require('mongoose')
const {Schema} = mongoose
const categorySchema = new Schema({
    type : {
        type : String,
    },
    title : {
        type : String
    },
    slug : {
        type :String
    }
}, { timestamps: true })
module.exports = mongoose.model('category',categorySchema)