const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const gemini = require('../controllers/gemini');
const run = require('../controllers/gemini');
const UserModel = require('../userModel');
const preferencesModel = require('../models/preferencesModel');
const ChatModel = require('../models/chatModel');

router.use(express.json());

// Create a message
router.post('/', async (req, res) => {
  try {
    console.log("New message received: ", req.body.query);
    const participantId = req.body.participantId;
    const user = await UserModel.findOne({ useruid: participantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const _id = user._id;

    const newMessage = new Message(req.body.query);
    const savedMessage = await newMessage.save();

    let matchingValueBoolean = false;

    const preferences = await preferencesModel.findOne({ user: user._id }).exec();
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found' });
    } else {
      const matchingPreference = preferences.preferences.find(preference => preference.valueName === "current_value");
      if (!matchingPreference) {
        matchingValueBoolean = false;
        console.log("Matching preference not found");
      } else {
        const matchingValue = matchingPreference.value;
        matchingValueBoolean = matchingValue === 'true';

        console.log("gmail pref: ", matchingValueBoolean);
      }
    }

    const geminiResponse = await run(req.body.query, matchingValueBoolean, _id);
    if (!geminiResponse) {
      return res.status(404).json({ message: 'Gemini response not found' });
    }

    const botMessage = new Message({ chatId: req.body.query.chatId, content: geminiResponse, isBot: true });
    const savedbotMessage = await botMessage.save();

    console.log(savedbotMessage);

    // Find the chat and update the messages reference array
    const chat = await ChatModel.findOne({id : req.body.query.chatId}).exec();
    if (!chat) {
      console.log("Chat not found");
      return res.status(404).json({ message: 'Chat not found' });
    }
    console.log("Chat found: ", savedMessage._id, savedbotMessage._id);
    chat.messages.push(savedMessage._id);
    chat.messages.push(savedbotMessage._id);
    await chat.save();

    res.status(201).json(savedbotMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for a chat
router.get('/chat/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById({_id: req.params.id});
    if (!message) return res.status(404).json({ message: 'Message not found' }); 
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a message
router.put('/:id', async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate({_id: req.params.id}, req.body, { new: true });
    if (!updatedMessage) return res.status(404).json({ message: 'Message not found' }); 
    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete({_id: req.params.id});
    if (!deletedMessage) return res.status(404).json({ message: 'Message not found' }); 
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

