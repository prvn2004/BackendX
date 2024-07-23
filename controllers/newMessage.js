const Message = require('../models/messageModel');
const { processMessage } = require('../controllers/gemini'); // Use a more descriptive name
const userModel = require('../models/userModel');
const getPreferencesByUser = require('../controllers/commonFunctions/getPreferencesByUser');
const chatModel = require('../models/chatModel');

// Error class for more structured error handling
class ChatError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
  }
}

async function newMessage(req) {
  try {
    const reqObj = JSON.parse(req); // Get data from request body

    const participantId = reqObj.participantId;
    const user = await userModel.findOne({ useruid: participantId });
    if (!user) {
      throw new ChatError('User not found', 404);
    }

    const chatId = await getOrCreateChat(participantId, reqObj.chatId);

    const newMessage = new Message({
      chatId,
      content: reqObj.query.content, // Access content directly from reqObj
      isBot: reqObj.query.isBot,
    });
    await newMessage.save();

    const preferences = await getPreferencesByUser(user._id, 'current_value');
    if (!preferences) {
      throw new ChatError('Preferences not found', 404);
    }

    const useTools = preferences.value === 'true';

    // Pass the message data to the gemini controller
    const geminiResponse = await processMessage(
      newMessage, 
      user._id,
      useTools
    );

    if (geminiResponse.error) {
      throw new ChatError(geminiResponse.error, geminiResponse.code || 500);
    }

    const botMessage = new Message({
      chatId,
      content: geminiResponse.message, // Assuming the response is in geminiResponse.message
      isBot: true,
    });
    await botMessage.save();

    return { status: 201, message: botMessage };
  } catch (err) {
    if (err instanceof ChatError) {
      return { status: err.code, message: { err: err.message } };
    } else {
      console.error('Error processing new message:', err);
      return { status: 500, message: { err: 'Internal server error' } };
    }
  }
}

async function getOrCreateChat(participantId, chatId) {
  try {
    if (chatId) {
      // Check if a chat with the given ID exists and the user is a participant
      const existingChat = await chatModel.findOne({ _id: chatId, participant: participantId });
      if (existingChat) {
        return chatId;
      } else {
        throw new ChatError('Invalid Chat ID', 400); // Bad Request
      }
    } else {
      const user = await userModel.findOne({ useruid: participantId });
      if (!user) {
        throw new ChatError('User not found', 404);
      }

      const newChat = new chatModel({ participant: user._id });
      const savedChat = await newChat.save();
      return savedChat._id;
    }
  } catch (err) {
    if (err instanceof ChatError) {
      throw err; // Re-throw if it's a ChatError
    } else {
      throw new ChatError('Error creating new chat', 500);
    }
  }
}

async function getAllMessages(req, res) {
  try {
    const chatId = req.params.chatId; // Get chatId from request parameters
    const messages = await Message.find({ chatId }).exec();

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
}

module.exports = { newMessage, getAllMessages };