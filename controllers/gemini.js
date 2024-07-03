const { GoogleGenerativeAI } = require("@google/generative-ai");
const Message = require("../models/messageModel");
const moment = require('moment');
const GmailEmailsModel = require('../models/gmailEmailsModel');

require("dotenv").config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(message, isGmail, _id) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get the last 30 messages from the message schema using chatId
    const thirtyDaysAgo = moment().subtract(30, 'days'); // Calculate the date 30 days ago

    let history = [];

   if(isGmail) {

    try {
        const gmailEmails = await GmailEmailsModel.find({ user: _id });

        let mailString = ' Act as a assistant which provide help regarding summarising emails, i will provide you with email details and you have to answer according to only them : Here are my emails: ';

        gmailEmails.forEach((email) => {
            console.log(email.internalDate);
            mailString += "[ ";
            mailString += " Labels : ";
            mailString += `[${email.labelIds.join(', ')}]`;
            mailString += " TO : ";
            mailString += email.to;
            mailString += " FROM : ";
            mailString += email.from;
            mailString += " SUBJECT : ";
            mailString += email.subject;
            mailString += " DATE : ";
            mailString += convertMillisecondsToDate(parseInt(email.internalDate));
            // mailString += " MESSAGE : ";
            // mailString += email.message;
            mailString += " ]";
        });

        const emailHistory = {
            role: 'user',
            parts: [{ text: mailString }]
        };
    
        const botHistory = {
            role: 'model',
            parts: [{ text: 'Understood, I will help you like an email assistant' }]
        };
    
        history.push(emailHistory, botHistory);
    } catch (error) {
        // Handle the error here
        console.error(error);
        // You can throw the error or return an error message
        throw new Error("Failed to fetch Gmail emails");
    }


    // Use the mailString variable as needed
   }

    const messages = await Message.find({ 
        chatId: message.chatId
    }).where('timestamp').gte(thirtyDaysAgo).sort({ timestamp: 'desc' }).limit(10);

    // Convert the messages into the history format
    messages.forEach((msg, index) => {
        var role = msg.isBot ? 'model' : 'user';
        const nextRole = index < messages.length - 1 ? (messages[index + 1].isBot ? 'model' : 'user') : role;
        if (nextRole != role) {
            history.push({
                role: role,
                parts: [{ text: msg.content }],
            });
        }
    });

    // Log all history
    history.forEach((h) => {
        console.log("history log : " + h.parts[0].text);
    });


    const chat = model.startChat({
        history: history
    });

    const msg = message.content;  
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    const modifiedText = text.replace(/\*\*(.*?)\*\*/g, '- $1');

    return modifiedText; // Return the text instead of logging it
}

function convertMillisecondsToDate(ms) {
    // Create a new Date object from milliseconds
    const date = new Date(ms);
  
    // Extract the date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
  
    // Extract the time components
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Return the formatted date string
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

module.exports = run;
