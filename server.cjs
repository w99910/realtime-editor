const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    console.log('A user connected');

    let events = [
        'block-changed',
        'block-added',
        'block-removed',
        'selection',
    ]

    events.forEach((event) => {
        socket.on(event, (...data) => {
            socket.broadcast.emit(event, ...data)
        })
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Signaling server running on port 3000');
});
