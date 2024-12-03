const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const newMessage = require('./controllers/newMessage');
const { initSockets } = require('./controllers/commonFunctions/Socket/initSockets');
const cors = require('cors');

const server = createServer(app);
const io = new Server(server);

// Middleware to log all API requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

mongoose.connect("mongodb+srv://prvn:prvn2004@mernapp.wh18ryw.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

app.get('/', (req, res) => {
    res.sendStatus(200);
});

// Test GET endpoint with mock data
app.get('/mock', (req, res) => {
    res.json({
        message: "This is a mock response",
        success: true,
        data: {
            id: 1,
            name: "Mock Data",
            description: "This is some mock data for testing."
        }
    });
});

app.use(cors());
app.use('/user', userRoutes);
app.use('/chat', require('./routes/chatRoutes'));
app.use('/message', require('./routes/messageRoutes'));
app.use('/oauth2code', require('./routes/authCodeRoutes'));
app.use('/test', require('./routes/testRoutes'));
app.use('/preferences', require('./routes/preferencesRoutes'));
app.use('/followup', require('./routes/followupRoutes'));
app.use('/web', require('./routes/webRoutes'));

io.on('connection', (socket) => {
    console.log('A user connected');

    initSockets(socket, io);
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = io;
