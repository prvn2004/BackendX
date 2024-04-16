const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true, required: true },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

