const homeRoute = require('./home.route')
const authRoute =  require('./auth.route')
const adminRoute = require('./admin.route')
const departmentRoute = require('./department.route')
const notificationRoute = require('./notification.route')
const profileRoute = require('./profile.route')
const postRoute = require('./post.route')
const route = app => {
    app.use('/',homeRoute)
    app.use('/admin',adminRoute)
    app.use('/auth',authRoute)
    app.use('/department',departmentRoute)
    app.use('/notification',notificationRoute)
    app.use('/profile',profileRoute)
    app.use('/post/api',postRoute)
    app.use((req,res) => {
        res.render('404-page')
    })
}

module.exports = route
