const { GoogleGenerativeAI } = require("@google/generative-ai");
const Message = require("../models/messageModel");
const moment = require('moment');
const instructions = require('./gemini/instructions');
const { processData } = require('./gemini/geminiAutomationLib/automation');
const personalData = require('../models/personalData');

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Configuration for tool usage
const MAX_TOOL_USES = 5;

class GeminiError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}

async function processMessage(message, userId, useTools) {
  try {
    let context = await buildInitialContext(message, userId, useTools);
    let finalToolOutput = '';

    let msg;

    for (let toolUses = 0; toolUses < MAX_TOOL_USES; toolUses++) {
      // Await the result of processData
        msg = await processData("", context.currentQuery, userId, context.history);

      if (msg.code !== 200 && msg.code !== 201) {
        throw new GeminiError(msg.status, msg.code);
      }

      context.toolResponses.push({
        tool: msg.tool,
        query: context.currentQuery,
        response: msg.status,
      });

      finalToolOutput += `Used tool: ${msg.tool} \n response: ${msg.status}\n You can choose next tool following instructions if necessary or just give the user response.`;

      // Break the loop if processData signals completion (code 200)
      if(msg.code === 200){
        break;
      }

      // Update the query for the next iteration if needed
      context.currentQuery = finalToolOutput; 
    }

    // Make sure msg is defined (it should be after the loop)
    if (!msg) {
      throw new GeminiError("No response from tools", 500);
    }

    const responseText = msg.status.replace(/\*\*(.*?)\*\*/g, '- $1');

    await updateUserToolUsage(userId, context.toolResponses.length);

    return {
      message: responseText,
      code: 200,
    };
  } catch (error) {
    if (error instanceof GeminiError) {
      return { error: error.message, code: error.code };
    } else {
      console.error("Error in processMessage:", error);
      return { error: "An error occurred.", code: 500 };
    }
  }
}

// --- Helper Functions ---

async function buildInitialContext(message, userId, useTools) {
  const context = {
    currentQuery: message.content,
    toolResponses: [],
    history: [],
  };

  if (1 == 1) {
    // Add instructions as the first user message
    context.history.push({
      role: 'user', 
      parts: [{ text: await getUserInstructions(userId) }] 
    });

    // Add model acknowledgment
    context.history.push({ 
      role: 'model', 
      parts: [{ text: 'Understood. I will keep these instructions.' }] 
    }); 
  }

  // Add recent messages, maintaining user-model alternation, AFTER instructions
  context.history = context.history.concat(await getRecentMessagesHistory(message.chatId));

  return context;
}

async function getUserInstructions(userId) {
  const personalD = await personalData.findOne({ user_id: userId });
  if (personalD) {
    const timeline = personalD.timeline || '';
    const history_d = personalD.history || '';
    const bio = personalD.bio || '';
    return `${instructions.TESTING} \n USERS DATA : ${bio} \n USERS UPCOMING EVENTS: \n ${timeline} \n USER PAST EVENTS/HISTORY ${history_d}`;
  } else {
    return ''; // Or some default instructions
  }
}

async function updateUserToolUsage(userId, toolCount) {
  // Logic to update user data (e.g., in database) 
  console.log(`Updated user ${userId} tool usage count to ${toolCount}`);
}

async function getRecentMessagesHistory(chatId) {
  const thirtyDaysAgo = moment().subtract(30, 'days');
  const recentMessages = await Message.find({ chatId })
    .where('timestamp').gte(thirtyDaysAgo)
    .sort({ timestamp: 'desc' })
    .limit(10) 
    .exec();

  const history = [];

  async function getRecentMessagesHistory(chatId) {
    const thirtyDaysAgo = moment().subtract(30, 'days');
    const recentMessages = await Message.find({ chatId })
      .where('timestamp').gte(thirtyDaysAgo)
      .sort({ timestamp: 'desc' })
      .limit(10)
      .exec();
  
    const history = [];
    let lastRole = null; // Keep track of the last role added to history
  
    for (let i = recentMessages.length - 1; i >= 0; i--) { 
      const message = recentMessages[i];
      const role = message.isBot ? 'model' : 'user';
  
      // Only add the message if the role is different from the last one
      if (role !== lastRole) { 
        history.push({
          role: role,
          parts: [{ text: message.content }],
        });
  
        lastRole = role; // Update the last role 
      } 
    }
  
    return history.reverse(); // Reverse to maintain chronological order
  }

  return history;
}

module.exports = { processMessage };