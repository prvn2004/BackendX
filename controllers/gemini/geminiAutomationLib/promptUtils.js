const instructions = require('../instructions');

const buildPrompt = (promptNeeded, inputData, tools, userId = null, passCount, previousResponse = null) => {

    console.log('Building prompt...');
    console.log('Prompt needed:', promptNeeded);
    console.log('Input data:', inputData);
    console.log('Available tools:', tools);
    console.log('User ID:', userId);
    console.log('Pass count:', passCount);

    let prompt = instructions.TEST_PROMPT + `\nCurrent Data: ${JSON.stringify(inputData)}`;

    // let prompt = instructions.TEST_PROMPT + `\nCurrent Data: ${JSON.stringify(inputData)}
    //               Available Tools: ${tools.join(', ')}
    //               UserId: ${userId}
    //               Pass Count: ${passCount}`;

    if (previousResponse) {
        console.log('Previous response:', previousResponse);
        prompt += `\nPrevious Response: ${JSON.stringify(previousResponse)}`;
    }

    console.log('Prompt built:', prompt);
    return prompt;
};

module.exports = { buildPrompt };
