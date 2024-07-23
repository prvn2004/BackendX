const { model, generationConfig } = require("../../../config"); // Assuming model and config are imported
const  PersonalData  = require("../../../models/personalData.js"); // Assuming personalData model is imported
const instructions = require("../instructions"); // Assuming instructions are imported
const { extractMainText } = require("./utils.js"); // Assuming utils file exists

// Define your tools in an enum for better organization
const Tools = {
  BIO: "bio",
  HISTORY: "history",
  TIMELINE: "timeline",
  ASK_USER: "ask_user",
  CURRENT_INFO: "current_info",
  BROWSE: "browse",
  EMAIL: "email",
  CONTACTS: "contacts",
  MESSAGE: "message",
};

// Error handling class for more structured error management
class ToolExecutionError extends Error {
  constructor(message, code = 500) { // Default to 500 Internal Server Error
    super(message);
    this.name = "ToolExecutionError";
    this.code = code;
  }
}

// Factory function to create tool instances
const createToolInstance = (toolName) => {
  switch (toolName) {
    case Tools.BIO:
    case Tools.HISTORY:
    case Tools.TIMELINE:
      return new PersonalDataTool(toolName); 
    case Tools.ASK_USER:
    case Tools.CURRENT_INFO:
    case Tools.BROWSE:
    case Tools.EMAIL:
    case Tools.CONTACTS:
    case Tools.MESSAGE:
      return new GenericTool(toolName);
    default:
      throw new ToolExecutionError(`Tool '${toolName}' not found.`, 400);
  }
};

// Base class for tools
class Tool {
  constructor(name) {
    this.name = name;
  }

  async execute(userId, data) {
    throw new Error("Execute method not implemented."); 
  }
}

// Tool for interacting with personal data (Bio, History, Timeline)
class PersonalDataTool extends Tool {
  constructor(name) {
    super(name);
    this.promptKey = `${name.toUpperCase()}_MANAGER`; 
  }

async execute(userId, data) {
  try {
    console.log(`[${this.name}] Tool execution started with userId: ${userId}, data: ${data}`); 

    let personalD = await PersonalData.findOne({ user_id: userId }).exec();
    if (!personalD) {
      console.log(`[${this.name}] User not found, creating a new entry.`);
      personalD = new personalData({ user_id: userId });
    }

    const fieldToUpdate = this.name;
    const existingValue = personalD[fieldToUpdate] || "";

    const currDateTime = getCurrentDateTime();
    const prompt = instructions[this.promptKey];

    // console.log(`[${this.name}] Generated Prompt: ${` ${prompt} \n ${currDateTime} | EXISTING ${fieldToUpdate.toUpperCase()} : ${existingValue} | new data : ${data}`}`);

    const response = (
      await model.generateContent(
        ` ${prompt} \n ${currDateTime} | EXISTING ${fieldToUpdate.toUpperCase()} : ${existingValue} | new data : ${data}`
      )
    ).response;

    console.log(`[${this.name}] Model Response: ${response.text()}`);

    const newValue = extractMainText(response.text());

      personalD[fieldToUpdate] = newValue;
      await personalD.save();
      console.log(`[${this.name}] User data updated successfully.`);

      return {
        status: `Updated user's ${fieldToUpdate}`,
        code: 201,
      };
    

  } catch (error) {
    console.error(`[${this.name}] Error during execution:`, error); 
    if (error instanceof ToolExecutionError) {
      throw error; // Re-throw specific tool errors
    } else {
      throw new ToolExecutionError(
        `Error executing tool '${this.name}': ${error.message}`
      );
    }
  }
}
}

// Generic tool class 
class GenericTool extends Tool {
  constructor(name) {
    super(name);
  }

  async execute(userId, data) {
    try {
      // Define logic for generic tools below
      const result = await this[this.name](userId, data);
      return {
        status: result.response || "Tool executed successfully",
        code: 201,
      };
    } catch (error) {
      throw new ToolExecutionError(
        `Error executing tool '${this.name}': ${error.message}`
      );
    }
  }

  // Define functions for generic tools within the class
  async ask_user(userId, data) {
    return {
      status: 201,
      response: `yes do it`,
    };
  }

  async current_info(userId) {
    return {
      status: 201,
      response: {
        location: "San Francisco, CA",
        openApps: ["Browser", "Music", "Calendar"],
      },
    };
  }

  async browse(userId, query) {
    return {
      status: 201,
      response: [
        `Top result for '${query}' from Example.com`,
        `Second result for '${query}' from Website.org`,
      ],
    };
  }

  async email(userId, data) {
    const { to, subject, body } = data;
    return {
      status: 201,
      response: `Email sent to ${to} with subject '${subject}'`,
    };
  }

  async contacts(userId, data) {
    if (data.action === 'retrieve') {
      return {
        status: 201,
        response: { 
          name: "John Doe", 
          number: "555-123-4567" 
        }
      };
    } else if (data.action === 'save') {
      return {
        status: 201,
        response: `Contact '${data.name}' with number '${data.number}' saved successfully!`
      };
    } else {
      throw new ToolExecutionError(`Invalid contact action: ${data.action}`, 400); 
    }
  } 

  async message(userId, data) {
    if (data.action === 'retrieve') {
      return {
        status: 201,
        response: [
          "Hey, how are you?", 
          "See you at 7pm!"
        ]
      };
    } else if (data.action === 'send') {
      return {
        status: 201,
        response: `Message sent to ${data.number}: ${data.message}`
      };
    } else {
      throw new ToolExecutionError(`Invalid message action: ${data.action}`, 400);
    }
  }

  async final_output(userId, data) {
    return {
      status: 201,
      response: data, 
    };
  }
}

// DateTime function
function getCurrentDateTime() {
  return new Date().toLocaleString(); 
}

module.exports = {
  createToolInstance,
  Tools, 
};