const express = require('express')
const path = require('path')
const http = require('http');
const Filter = require('bad-words')
const socketio = require('socket.io')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,getUser,getUsersInRoom,removeUser}=require('./utils/users')
const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000


const publicDirectory = path.join(__dirname, "../public")

app.use(express.static(publicDirectory))

// let count=0
//connection is event
io.on('connection', (socket) => {

    // console.log("new socket")

    // socket.emit('countupdated',count)
    // socket.on('increment',()=>{
    //     count++;
    //    // socket.emit('countupdated',count)
    //    io.emit('countupdated',count)
    // })
   
    // socket.emit('message',generateMessage("Welcome"))
    // socket.broadcast.emit("message", generateMessage("A new user has joined"))
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error)
        {
           return callback(error)
        }
        console.log(socket.id)
        socket.join(user.room)
        socket.emit('message',generateMessage("Admin","Welcome"))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined !`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()

    })
    socket.on("sendMessage", (msg, callback) => {

        const user=getUser(socket.id)
        if(!user)
        {
            return callback("Message can't be send")
        }
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback("Profinity is not allowed")
        }
        io.to(user.room).emit("message", generateMessage(user.username,msg))
        
        callback()
    })
    socket.on("sendLocation", ({ latitude, longitude } = {}, callback) => {
        const user=getUser(socket.id)
        if(!user)
        {
            return callback("Message can't be send")
        }
        io.to(user.room).emit('Location-message',
        generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })
    

    socket.on("disconnect", () => {
      
        const user=removeUser(socket.id)
    
        if(user)
        {
         io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left`))
         io.to(user.room).emit("roomData",{
             room:user.room,
             users:getUsersInRoom(user.room)
         })
        }
    })
})

server.listen(port, () => {

    console.log("Listening to port " + port)
})
