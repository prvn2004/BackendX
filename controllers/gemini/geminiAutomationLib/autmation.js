const { model, generationConfig, generalConfig } = require('../../../config');
const geminiLib = require('./geminiLib');
const { buildPrompt } = require('./promptUtils');

async function processData(promptNeeded, inputData, userId = null, passCount, previousResponse = null) {
    try {
        const prompt = buildPrompt(promptNeeded, inputData, Object.keys(geminiLib), userId, passCount, previousResponse);
        console.log('Prompt:', prompt);

        let chat = await model.startChat({
            generationConfig: generationConfig
        });
        console.log('Chat started:', chat);

        const result = await chat.sendMessage(prompt);
        console.log('Message sent:', result);

        const geminiResponse = await result.response;
        console.log('Gemini response:', geminiResponse.text());

        // const safeResponse = await executeGeminiInstructions(geminiResponse.text());
        console.log('Safe response:', safeResponse);

        // if (safeResponse.requiresMorePasses && passCount < generalConfig.maxPasses) {
        //     return processData(safeResponse.data, userId, passCount + 1, safeResponse);
        // } else {
        //     return safeResponse;
        // }.

        return geminiResponse.text();
    } catch (error) {
        console.error("Error in processing loop:", error);
        return { error: "An error occurred." };
    }
}

const executeGeminiInstructions = async (instructions) => {
    let result = {};
    try {
        const geminiResponse = JSON.parse(instructions);
        const { response, actions, requiresMorePasses } = geminiResponse;

        console.log('Gemini response:', response);

        for (const action of actions) {
            // Extract function name and arguments
            const match = action.match(/(\w+)\((.*)\)/); 
            if (match) {
                const func = match[1];
                const argsStr = match[2]; // Get arguments as string

                if (func in geminiLib) {
                    // Evaluate arguments string as a JavaScript object (USE WITH CAUTION!)
                    let args;
                    try {
                        args = eval(`(${argsStr})`);
                        console.log('Executing function:', func, 'with arguments:', args);
                        result = await geminiLib[func](args); // Pass the evaluated arguments object 
                        console.log('Function result:', result);
                    } catch (evalError) {
                        console.error(`Error evaluating arguments for ${func}: ${evalError.message}`);
                        continue; // Skip to next action
                    }
                }
            }
        }

        console.log('Requires more passes:', requiresMorePasses);

        return {
            response,
            requiresMorePasses,
            ...result
        };
    } catch (error) {
        console.error("Safe execution error:", error);
        result = { error: "Invalid instruction or data." };
        return result;
    }
};

module.exports = { processData };
