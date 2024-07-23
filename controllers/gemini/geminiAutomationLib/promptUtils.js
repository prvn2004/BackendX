const instructions = require('../instructions');

const buildPrompt = (promptNeeded = "", inputData) => {

    //console.log('Building prompt...');
    //console.log('Prompt needed:', promptNeeded);
    //console.log('Input data:', inputData);

    let prompt = `\n${promptNeeded + `\n User Query : \n` + JSON.stringify(inputData)}`;

    //console.log('Prompt built:', prompt);
    return prompt;
};

module.exports = { buildPrompt };
