const mongoose = require('mongoose');

const pendingNotificationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        default: mongoose.Types.ObjectId
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    followup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'followupsModel'
    },
});

const PendingNotification = mongoose.model('PendingNotification', pendingNotificationSchema);

module.exports = PendingNotification;