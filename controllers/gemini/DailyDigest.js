const {processInstruction , passThroughClassifyMails, shouldFollowuped} = require('./classifyFollowup');
const instruction = require('./instructions');


//here emails is json of emails array
async function dailyDigest(emails){
    try {
        const instruct = instruction.DAILY_EMAIL_DIGEST;

        const result = await processInstruction(emails, instruct);

        //here is result of jsonstring returned from gemini
        return { status: 201, result: result };
    } catch (error) {
        console.error(error);
       return { status: 500, result: "Error in daily digest"};
    }
};

module.exports =  dailyDigest;