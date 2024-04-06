const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Token', tokenSchema);