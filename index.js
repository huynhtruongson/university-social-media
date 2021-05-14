const express = require('express')
const cookie = require('cookie-parser')
const session = require('express-session')
const passport = require('passport');
const favicon = require('serve-favicon')
const path = require('path')
const route = require('./src/routes')
const mongoConnect = require('./src/config/dbConfig')
const passportConfig = require('./src/config/passportConfig')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.use(express.static('./src/public'))
app.use(favicon(path.join(__dirname,'src','public','images', 'favicon.ico')))
app.set('view engine','pug')
app.set('views','./src/views')
app.set('socketio', io);
app.use(cookie())
app.use(session({ secret: 'anhyeuem' }));
app.use(express.urlencoded({extended : false}))
app.use(express.json())
app.use(passport.initialize());
app.use(passport.session());

//MongoDB Connect
mongoConnect()
//Passport config
passportConfig()
// Route
route(app)
//Socket
io.on('connection',socket => {
    socket.on('student-connect',()=>{
        socket.join('students')
    })
    socket.on('user-comment',(id) => {
        socket.broadcast.emit('user-comment',id)
    })
    socket.on('user-leave-comment',(id) => {
        socket.broadcast.emit('user-leave-comment',id)
    })
    socket.on('user-submit-comment',({id,comment,amount}) => {
        socket.broadcast.emit('user-submit-comment',{id,comment,amount})
    })
})
const PORT = process.env.PORT || 8080
http.listen(PORT,()=> console.log(`App running at port ${PORT}`))