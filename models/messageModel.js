const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true, required: true },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isBot: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;