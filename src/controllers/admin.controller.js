const User = require('../models/User.model')
const {handleCreateAccountErrors} = require('../helpers/handle-errors')
const APIFeatures = require('../helpers/handle-feature-api')
const Category = require('../models/Category.model')

module.exports.getAdmin = async (req,res) => {
    try {
        let categories = await Category.find({})
        categories = categories.map(category => category.title)
        const users = await User.find({role : 1}).sort('-createdAt').limit(10).select('-password')
        const totalRows = await User.countDocuments({role : 1})
        const totalPages = Math.ceil(totalRows/10)
        res.render('admin',{categories,users,totalPages})
    } catch (error) {
        throw error
    }
}
module.exports.postCreateUser = async (req,res) => {
    try {
        const {display_name,username,password,categories} = req.body
        const user = await User.createAccount(display_name,username,password,categories)
        res.status(200).json({user})
    } catch (error) {
        const errors = handleCreateAccountErrors(error)
        res.status(400).json({errors})        
    }
}
module.exports.getFeature = async (req,res) => {
    try {
        req.query.role = 1
        const categories = req.query.categories
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const queryCount = {role : 1,categories}
        if(categories === 'all') {
            delete req.query.categories
            delete queryCount.categories
        }
        const apiFeatures = new APIFeatures(User.find(),req.query).filter().sort().pagination()
        const users = await apiFeatures.query.select('-password')
        const totalRows = await User.countDocuments(queryCount)
        const totalPages = Math.ceil(totalRows/limit)
        res.json({users,pagination : {page,limit,totalPages,totalRows}})
    } catch (error) {
        res.status(400).json(error.message)
    }
}