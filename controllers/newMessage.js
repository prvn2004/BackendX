const Message = require('../models/messageModel');
const gemini = require('../controllers/gemini');
const run = require('../controllers/gemini');
const userModel = require('../models/userModel');
const preferencesModel = require('../models/preferencesModel');


async function newMessage(req) {
    try {
        const reqObj = JSON.parse(req); // Convert req to a JSON object

        console.log("New message received: ", reqObj.query)
            const  participantId  = reqObj.participantId; 
            const user = await userModel.findOne({ useruid: participantId });
            if(!user) {
              return { status: 404, message: {err: 'User not found'} };
            }
            const _id = user._id;
        
            const newMessage = new Message(reqObj.query);
            const savedMessage = await newMessage.save();
        
            let matchingValueBoolean = false;
        
            const preferences = await preferencesModel.findOne({ user: user._id }).exec();
            if (!preferences) {
              return { status: 404, message: {err:'Preferences not found'} };
            }else{
              const matchingPreference = preferences.preferences.find(preference => preference.valueName === "current_value");
              if (!matchingPreference) {
                matchingValueBoolean = false;
                console.log("Matching preference not found")
              }else{
                const matchingValue = matchingPreference.value;
                matchingValueBoolean = matchingValue === 'true';
          
                console.log("gmail pref: ", matchingValueBoolean)
              }
            }
        
        
            const geminiResponse = await run(reqObj.query, matchingValueBoolean, _id);
            if(!geminiResponse) {
              return { status: 404, message: {err:'Gemini response not found'} };
            }
        
            const botMessage = new Message({ chatId: reqObj.query.chatId, content: geminiResponse, isBot: true });
            const savedbotMessage = await botMessage.save();
        
            console.log(savedbotMessage);
        
            return { status: 201, message: savedbotMessage };
          } catch (err) {
            return { status: 500, message: {err: err.message} };
          }
}

module.exports = newMessage;