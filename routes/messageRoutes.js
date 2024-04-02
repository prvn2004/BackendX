const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const gemini = require('../controllers/gemini');
const run = require('../controllers/gemini');

router.use(express.json());

// Create a message
router.post('/', async (req, res) => {
  try {
    console.log(req.body)
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    const geminiResponse = await run(req.body);

    const botMessage = new Message({ chatId: req.body.chatId, content: geminiResponse, isBot: true });
    const savedbotMessage = await botMessage.save();

    console.log(savedbotMessage);

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

