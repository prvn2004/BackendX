const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// Create Express app
const app = express();
const server = http.createServer(app);

// Create Socket.IO server
const io = new http.Server(server);

// Handle Socket.IO connections
io.on('connection', function(socket) {
    //console.log('Socket.IO client connected');

    // Handle messages from Socket.IO clients
    socket.on('message', async function(message) { // Add the 'async' keyword
        //console.log('received: %s', message);

        // Handle the message here

    });

    // Send a message to the Socket.IO client
    socket.emit('message', 'Socket.IO connection established');
});


