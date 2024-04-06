// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// const port = process.env.PORT || 3000;
// const userRoutes = require('./routes/userRoutes');

// mongoose.connect("mongodb+srv://prvn:prvn2004@mernapp.wh18ryw.mongodb.net/?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => {
//         console.log('Connected to MongoDB');
//     })
//     .catch((error) => {
//         console.error('Failed to connect to MongoDB:', error);
//     });


// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// app.use('/user', userRoutes);
// app.use('/chat', require('./routes/chatRoutes'));
// app.use('/message', require('./routes/messageRoutes'));
// app.use('/oauth2code', require('./routes/authCodeRoutes'));
// app.use('/test', require('./routes/testRoutes'));
// app.use('/preferences', require('./routes/preferencesRoutes'));

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

// MongoDB connection
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

// Regular HTTP routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/user', userRoutes);
app.use('/chat', require('./routes/chatRoutes'));
app.use('/message', require('./routes/messageRoutes'));
app.use('/oauth2code', require('./routes/authCodeRoutes'));
app.use('/test', require('./routes/testRoutes'));
app.use('/preferences', require('./routes/preferencesRoutes'));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected');

    // Handle messages from WebSocket clients
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    // Send a message to the WebSocket client
    ws.send('WebSocket connection established');
});

// Start the HTTP server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
