const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

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
    res.send('Hello World!');
});

app.use('/user', userRoutes);
app.use('/chat', require('./routes/chatRoutes'));
app.use('/message', require('./routes/messageRoutes'));
app.use('/oauth2code', require('./routes/authCodeRoutes'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});