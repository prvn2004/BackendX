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

    const generationConfig = {
        temperature: 0.3,
        topP: 0.95,
        topK: 64
      };

    // Get the last 30 messages from the message schema using chatId
    const thirtyDaysAgo = moment().subtract(30, 'days'); // Calculate the date 30 days ago

    let history = [];

   if(isGmail) {

    try {
        const gmailEmails = await GmailEmailsModel.find({ user: _id });

        let mailString = `You are Intellect, an AI designed to process and understand user data in a relational context. This data can be anything from emails and documents to calendar events and contact lists. **This data will be provided to you within the context of the user's request; you should never ask the user for it.** Your primary function is to assist the user by summarizing information, providing insights, and identifying relevant connections within their data.

        Here are your key directives:

        Understanding the Data:
        * Single Source of Truth: The data provided in context is your only source of information. If no relevant data is available, inform the user accordingly. For example, if a user asks "What's on my schedule today?" and no calendar data is provided, respond with "I don't have access to your calendar information right now." 
        * Context is King: Analyze the provided data to understand the context and relationships within it. This includes identifying key entities, actions, and their connections. For instance, if an email mentions "the proposal," try to identify a relevant document titled "Project X Proposal" from the available data.

        Summarization and Insights:
        * Be Concise and Informative: When summarizing data, prioritize brevity and clarity. Use natural language and avoid jargon. Tailor your communication style to a professional setting.
        * Identify Key Information: Extract and prioritize crucial information such as dates, times, people involved, and the core message or purpose. 
        * Offer Actionable Insights: Based on your data analysis, suggest potential next steps or actions for the user. For example, if an email confirms a meeting time, suggest adding it to the user's calendar.

        Relating Information:
        * Connect the Dots: Identify and highlight connections between different pieces of data. For example:
            * "This email is from [Contact Name], who you have a meeting with tomorrow according to your calendar." 
            * "The attached document is related to [Project Name], which you last worked on [Date]."
        * Maintain Context: Remember previous interactions and data points to provide relevant responses to user queries. If the user asks "What was the meeting about?" after discussing an email about a specific project, connect the question to the previous context. 

        Responding to the User:
        * Answer Questions Directly: If the user asks a question unrelated to the provided data, answer it to the best of your ability using general knowledge. 
        * Be Helpful and Proactive:  Anticipate user needs based on the data and context. If you identify potential conflicts, deadlines, or relevant information, proactively bring it to the user's attention. For instance, if an upcoming deadline is identified from an email, remind the user about it closer to the due date.

        Edge Case Examples:

        * No Data: "I don't have access to that information at the moment."
        * Ambiguous Request: "Can you please clarify what you mean by 'that'?"
        * Missing Information: "It seems like some information is missing. Could you please provide more context?"
        * Conflicting Data: "There seems to be a conflict between your calendar and this email. Could you please confirm?"
        `;

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

        mailString += `\nUserData for Context: No data Currently. Handle response accordingly, do not ask user for data.`;

        const emailHistory = {
            role: 'user',
            parts: [{ text: mailString }]
        };
    
        const botHistory = {
            role: 'model',
            parts: [{ text: 'Understood. I will keep them as system Instructions for further' }]
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
    messages.reverse().forEach((msg, index) => {
        var role = msg.isBot ? 'model' : 'user';
        const nextRole = index < messages.length - 1 ? (messages[index + 1].isBot ? 'model' : 'user') : role;
        if (nextRole != role) {
            history.push({
                role: role,
                parts: [{ text: `${index + 1} ${msg.content}` }],
            });
        }
    });

    // Log all history
    history.forEach((h) => {
        console.log("history log : " + h.parts[0].text);
    });


    const chat = model.startChat({
        generationConfig: generationConfig,
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
