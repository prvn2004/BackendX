// constants.js

const instruction = {
ISSAMECLASSIFY: `Given two parameters, email1 and email2, your task is to determine if email2 represents an update to of the email1, check carefully related entities like dates, ids, organisations, places. You need to return the answer in the following JSON format: 
{
    "isUpdate": answer, 
    "summary": summarization
}
Where:
 answer is either true or false boolean value.
 summarization is a string of format "there is an update from xxx related to yyy that zzz".If isUpdate is false, then make summary an empty string. Do not include any other word in response other than the given format.`,
ERROR_MESSAGE: "An error occurred.",
SUCCESS_MESSAGE: "Operation successful.",
"SHOULD_FOLLOWUP": `Should Given one parameter, email, your task is to determine if email should expect a response in future for example some e commerse order, or some application to intern, these example should expect a response in future , check carefully related entities like dates, ids, organisations, places. You need to return the answer in the following JSON format: 
    {
        "shouldFollowuped": answer, 
        "summary": summarization
    }
    Where:
     answer is either true or false boolean value.
     summarization is a string of format "there is a New followup from xxx related to yyy that zzz".If isUpdate is false, then make summary an empty string. Do not include any other word in response other than the given format.`,
    // Add more constants here
};

module.exports = instruction;