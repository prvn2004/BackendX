const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const newMessage = require('./controllers/newMessage');
const {initSockets} = require('./controllers/commonFunctions/Socket/initSockets');


const server = createServer(app);
const io = new Server(server);

mongoose.connect("mongodb+srv://prvn:prvn2004@mernapp.wh18ryw.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

app.get('/', (req, res) => {
    res.send(200);
});

app.use('/user', userRoutes);
app.use('/chat', require('./routes/chatRoutes'));
app.use('/message', require('./routes/messageRoutes'));
app.use('/oauth2code', require('./routes/authCodeRoutes'));
app.use('/test', require('./routes/testRoutes'));
app.use('/preferences', require('./routes/preferencesRoutes'));
app.use('/followup', require('./routes/followupRoutes'));

io.on('connection', (socket) => {
    console.log('a user connected');

    initSockets(socket, io);
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = io;