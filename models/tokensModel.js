const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Token', tokenSchema);