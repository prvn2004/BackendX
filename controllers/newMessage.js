const Message = require('../models/messageModel');
const gemini = require('../controllers/gemini');
const run = require('../controllers/gemini');
const userModel = require('../models/userModel');
const preferencesModel = require('../models/preferencesModel');
const getPreferencesByUser = require('../controllers/commonFunctions/getPreferencesByUser');
const chatModel = require('../models/chatModel')

async function newMessage(req) {
  try {
    const reqObj = JSON.parse(req); // Convert req to a JSON object

    console.log("New message received: ", reqObj.query);
    const participantId = reqObj.participantId;
    const user = await userModel.findOne({ useruid: participantId });
    if (!user) {
      return { status: 404, message: { err: 'User not found' } };
    }
    const _id = user._id;

    const chatId = reqObj.query.chatId;
    let newChatId = chatId;
    if (!chatId || chatId === "") {
      // Create a new chat and get the generated chatId
      const participantId = reqObj.participantId;
      const newChat = await createNewChat(participantId);
      newChatId = newChat.message._id;
    }

    const newMessage = new Message({chatId: newChatId, content: reqObj.query.content, isBot: reqObj.query.isBot});
    const savedMessage = await newMessage.save();

    let matchingValueBoolean = false;

    const preferences = await getPreferencesByUser(user._id, "current_value");
    if (!preferences) {
      return { status: 404, message: { err: 'Preferences not found' } };
    } else {
      const matchingValue = preferences.value;
      matchingValueBoolean = matchingValue === 'true';

      console.log("gmail pref: ", matchingValueBoolean);
    }

    const geminiResponse = await run(savedMessage, matchingValueBoolean, _id);
    if (!geminiResponse) {
      return { status: 404, message: { err: 'Gemini response not found' } };
    }

    const botMessage = new Message({ chatId: newChatId, content: geminiResponse, isBot: true });
    const savedbotMessage = await botMessage.save();

    console.log(savedbotMessage);

    return { status: 201, message: savedbotMessage };
  } catch (err) {
    console.log("Error saving message:", err)
    return { status: 500, message: { err: err.message } };
  }
}

async function createNewChat(participantId) {
  try {
    const user = await userModel.findOne({ useruid: participantId }).exec();
    if (!user) return { status: 404, message: 'User not found' };

    const newChat = new chatModel({
      participant: user._id,
    });

    const savedChat = await newChat.save();
    console.log(savedChat);
    
    return { status: 201, message: savedChat };
  } catch (err) {
      return { status: 500, message: err.message };
  }
}

async function getAllMessages(chatId) {
  try {
    const messages = await Message.find({ chatId: chatId }).exec();
    console.log("All messages retrieved:", messages);
    return { status: 201, messages };
  } catch (err) {
    console.error("Error retrieving messages:", err);
    return { status: 500, messages: { err: err.message } };
  }
}

module.exports = { newMessage, getAllMessages };
