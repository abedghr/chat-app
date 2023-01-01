const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io')

const {generateMessage, generateLocationMessage} = require('./js/message');
const {isRealString} = require('./js/isRealString');
const {User} = require('./classes/user');
const clientPath = path.join(__dirname, '/../client');
const port = process.env.PORT || 3000;
let app = express();
app.use(express.static(clientPath));
let server = http.createServer(app);
let io = socketIo(server);
let users = new User();

io.on('connection', (socket) => {
    socket.on('join', (params, callback) => {
        if(!isRealString(params.username) || !isRealString(params.room)) {
            return callback("username and room are required !");
        }

        socket.join(params.room); // join user to specific socket room.
        users.removeUser(socket.id); // remove user from any another room if he already joined another room.
        users.addUser(socket.id, params.username, params.room); // add User Under specific room.

        // Get the updated users list for specific room.
        io.to(params.room).emit('updateUsersList', users.getUsersList(params.room));

        // When a new user join chatApp under specific room
        socket.to(params.room).emit("newMsg", generateMessage('Admin', `Welcome to ${params.room} Room.`))

        // Send to the joined user that is a new joiner under specific room.
        socket.broadcast.to(params.room).emit("newMsg", generateMessage('Admin', `a new user joined the ${params.room} room.`));

        callback();
    })

    socket.on("createNewMsg", (msg, callback) => {
        let user = users.getUser(socket.id);

        if(user && isRealString(msg.text)) {
            io.to(user.room).emit('newMsg', generateMessage(user.name, msg.text))
        }

        callback("This is a server callback message");
    })

    socket.on('createLocationMsg', (params) => {
        let user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocationMsg', generateLocationMessage(user.name, params.lat, params.long))
        }
    })

    socket.on("disconnect", () => {
        let user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUsersList', users.getUsersList(user.room));
            io.to(user.room).emit('newMsg', generateMessage('Admin', `${user.name} has been left the ${user.room} chat room.`));
        }
    });
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    console.log(`client path is ${clientPath}`);
})



