const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io')

const {generateMessage} = require('./js/message');
const clientPath = path.join(__dirname, '/../client');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIo(server);

app.use(express.static(clientPath));

io.on('connection', (socket) => {
    console.log("A new User Connected");

    // When a new user join chatApp
    socket.emit("newMsg", generateMessage('Admin', 'Welcome to ChatApp.'))

    // Send to the joined user that is a new user joined the chatApp.
    socket.broadcast.emit("newMsg", generateMessage('Admin', 'a new user joined the chatApp.'))

    socket.on("createNewMsg", (msg, callback) => {
        console.log("Create new msg : ", msg);
        socket.emit("newMsg", generateMessage(msg.from, msg.text));
        callback("This is a server callback message");
    })

    socket.on("disconnect", () => {
        console.log("User was disconnected");
    });
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    console.log(`client path is ${clientPath}`);
})



