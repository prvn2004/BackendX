const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

router.use(express.json());


// Create a chat by useruid
router.post('/', async (req, res) => {
  try {
    const participantId = req.body.participantId;
    const user = await User.findOne({ useruid: participantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newChat = new Chat({
      participant: user._id,
      // Add other properties of the chat here
    });

    const savedChat = await newChat.save();
    //console.log(savedChat);
    
    res.status(201).json(savedChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all chats by participant ID
router.get('/:participantId', async (req, res) => {
  try {
    const participantId = req.params.participantId;
    const user = await User.findOne({ useruid: participantId }).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const chats = await Chat.find({ participant: user._id });
    // //console.log(chats)
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent 3 chats by participant ID
router.get('/recent/:participantId', async (req, res) => {
  try {
    const participantId = req.params.participantId;
    const user = await User.findOne({ useruid: participantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const chats = await Chat.find({ participant: user._id }).sort({ timestamp: -1 }).limit(3);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById({_id: req.params.id});
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
