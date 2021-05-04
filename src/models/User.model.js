const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {Schema} = mongoose

const userSchema = new Schema({
    username: { 
        type: String,
        unique: true,
        sparse : true,
        trim : true
        // required : [true,"Please enter an username"]  
    },
    password: { 
        type: String,
        // required : [true,"Please enter an password"],
        trim :  true,
        minLength : [6,"Minimum password length is 6 characters"]
    },
    role: {
        type : Number,
        // default : 0
    },
    categories : {
        type : [String],
        // default : []
    },
    display_name : {
        type : String,
        trim : true
        // default : ''
    },
    class : {
        type : String,
        // default : ''
    },
    faculty : {
        type : String,
        // default : ''
    },
    avatar : {
        type : String,
        // default : ''
    },
    email : {
        type :String
    },
    google_id : {
        type : String
    }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
    if(this.google_id) {
        this.role = 0
        next()
    }
    else {
        this.role = 1
        const salt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password,salt)
        next()
    }
})
userSchema.statics.login = async function(username,password) {
    try {
        if(!username)
        // throw Error('empty username')
        return Promise.reject(Error('empty username'))
        if(!password)
            // throw Error('empty password')
            return Promise.reject(Error('empty password'))
        const user = await this.findOne({username})
        if(user) {
            const matched = await bcrypt.compare(password,user.password)
            if(matched)
                return Promise.resolve(user)
            else 
                // throw Error('incorrect password')
                return Promise.reject(Error('incorrect password'))
        }
        // throw Error('incorrect username')
        return Promise.reject(Error('incorrect username'))
    } catch (error) {
        return Promise.reject(Error(error.message))
    }
}
userSchema.statics.findOneOrCreate = async function(condition,profile) {
    try {
        const user = await this.findOne(condition)
        if(user)
            return Promise.resolve(user)
        else {
            const newUser = await this.create({
                ...condition,
                email : profile.email,
                display_name : profile.name,
                avatar : profile.picture
            })
            return Promise.resolve(newUser)
        }
    } catch (error) {
        return Promise.reject(Error(error.message))
    }
}
userSchema.statics.createAccount = async function(display_name,username,password,categories) {
    try {
        if(!display_name)
            return Promise.reject(Error('empty display_name'))
        if(!username)
            return Promise.reject(Error('empty username'))
        if(!password)
            return Promise.reject(Error('empty password'))
        if(!categories.length)
            return Promise.reject(Error('empty categories'))
        if(password.length < 6)
            return Promise.reject(Error('invalid password'))
        const user = await this.create({display_name,username,password,categories})
        return Promise.resolve(user)
    } catch (error) {
        return Promise.reject(error.message)
    }
}
userSchema.statics.updateProfileInfo = async function(id,data) {
    try {
        const {display_name,faculty,_class} = data
        if(!display_name)
            return Promise.reject(Error('empty display_name'))
        if(!faculty)
            return Promise.reject(Error('empty faculty'))
        if(!_class)
            return Promise.reject(Error('empty class'))
        const user = this.findByIdAndUpdate(id,{display_name,faculty,class : _class},{new : true})
        return Promise.resolve(user)
    } catch (error) {
        return Promise.reject(error.message)
    }
}
userSchema.statics.updateProfilePassword = async function(id,password,newPassword,reNewPassword) {
    try {
        if(!password)
            return Promise.reject(Error('empty password'))
        if(!newPassword)
            return Promise.reject(Error('empty new password'))
        if(!reNewPassword)
            return Promise.reject(Error('empty renew password'))
        if(newPassword.length < 6)
            return Promise.reject(Error('invalid new password'))
        if(newPassword !== reNewPassword)
            return Promise.reject(Error('invalid renew password'))
        const user = await this.findById(id)
        const isMatched = await bcrypt.compare(password,user.password)
        if(isMatched) {
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(newPassword,salt)
            const updatedUser = await this.findByIdAndUpdate(id,{password : hashedPassword},{new : true})
            return Promise.resolve(updatedUser)
        }
        else {
            return Promise.reject(Error('invalid password'))
        }
    } catch (error) {
        return Promise.reject(error.message)
    }
}
module.exports = mongoose.model('user',userSchema)