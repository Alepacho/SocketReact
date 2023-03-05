const express   = require('express');
const app       = express();
const client    = "http://localhost:5173";
const port      = 3000;
const http      = require('http');
const server    = http.createServer(app);

const corsConfig = {
    origin: client
};
const { Server } = require("socket.io");
const io = new Server(server, {
    ...corsConfig,
});

io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('chat join', (data) => {
        try {
            console.log(`${data.username} has joined the chat.`);
            io.emit('chat join', data);
        } catch (e) {
            console.warn("WARNING: Unable to get message. Invalid data!", e);
        }
    });

    socket.on('chat leave', (data) => {
        try {
            console.log(`${data.username} has left the chat.`);
            io.emit('chat leave', data);
        } catch (e) {
            console.warn("WARNING: Unable to get message. Invalid data!", e);
        }
    });

    socket.on('chat message', (data) => {
        try {
            // Notice that we use "io" instead of "socket" to send this message to anyone.
            console.log(`${data.username} (${data.date}): ${data.message}`);
            io.emit('chat message', data);
        } catch (e) {
            console.warn("WARNING: Unable to get message. Invalid data!", e);
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});