const { model, generationConfig, generalConfig } = require("../../../config");
const { createToolInstance, Tools } = require("./geminiLib"); // Import tool functions
const { buildPrompt } = require("./promptUtils");
const instructions = require("../instructions");
const countTokens = require("@google-cloud/text-to-speech");
const {
    extractFunctionCall,
    extractMainText,
  } = require("./utils.js"); 

const MAX_TOKENS = generalConfig.max_tokens;

async function processData(promptNeeded, inputData, userId, history = null) {
  try {
    const prompt = buildPrompt(promptNeeded, inputData);

    const countTokenInput = approximateTokenCount(
      `${JSON.stringify(history)} ${JSON.stringify(prompt)}`
    );
    console.log("Token count:", countTokenInput);

    if (countTokenInput > MAX_TOKENS) {
      return {
        status: "Input exceeds the token limit. Please reduce the input size and try again.",
        code: 400, 
      };
    }

    const chat = await model.startChat({
      generationConfig: generationConfig,
      history: history,
    });

    console.log("Chat started:", chat);
    const result = await chat.sendMessage(prompt);
    // console.log("Message sent:", result);

    const geminiResponse = await result.response;
    console.log("Gemini response:", geminiResponse.text());

    const functionCall = extractFunctionCall(geminiResponse.text());
    console.log("Function call:", functionCall);

    if (functionCall) {
        const mainText = extractMainText(geminiResponse.text());
        const tool = createToolInstance(functionCall); 

        if (tool) {
          try {
            const toolResult = await tool.execute(userId, mainText);
            return {
              status: toolResult.status, 
              code: toolResult.code,
              tool: functionCall.name, // Return the tool name
            };
          } catch (toolError) {
            // if (toolError instanceof ToolExecutionError) {
            //   return {
            //     status: toolError.message,
            //     code: toolError.code,
            //     tool: functionCall.name, // Return the tool name even if there's an error
            //   };
            // } else {
            //   console.error("Unexpected error during tool execution:", toolError);
              return {
                status: "An error occurred during tool execution.",
                code: 500, 
                tool: functionCall.name, // Return the tool name
              };
            // }
          }
        } else {
          return {
            status: `Error: Tool '${functionCall}' not found.`,
            code: 400, 
          };
        } 
      }

    return { status: geminiResponse.text(), code: 200 };
  } catch (error) {
    console.error("Error in processing loop:", error);
    return { status: "An error occurred.", code: 500 }; 
  }
}

function approximateTokenCount(text) {
    // console.log("Text : " + text);
    // Assuming 1 token ≈ 4 characters or 0.75 words (adjust as needed)
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;

    return Math.round(Math.max(characters / 4, words * 0.75));
}


module.exports = { processData };