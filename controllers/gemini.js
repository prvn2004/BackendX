const { GoogleGenerativeAI } = require("@google/generative-ai");
const Message = require("../models/messageModel");
const moment = require('moment');

require("dotenv").config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(message) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get the last 30 messages from the message schema using chatId
    const thirtyDaysAgo = moment().subtract(30, 'days'); // Calculate the date 30 days ago

const messages = await Message.find({ 
    chatId: message.chatId
})
.sort({ createdAt: -1 })
.limit(30);


    // Convert the messages into the history format
    const history = messages.map((msg, index) => {
        var role = msg.isBot ? 'model' : 'user';
        const nextRole = index < messages.length - 1 ? (messages[index + 1].isBot ? 'model' : 'user') : role;
        if (nextRole != role) {
            return {
                role: role,
                parts: [{ text: msg.content }],
            };
        }
        role = nextRole;
    }).filter(item => item !== undefined);  


    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 100,
        },
    });

    const msg = message.content;

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();

    return text; // Return the text instead of logging it
}

module.exports = run;
