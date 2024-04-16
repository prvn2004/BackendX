const { GoogleGenerativeAI } = require("@google/generative-ai");
const UserModel = require('../../models/UserModel');
const {ReferenceModel, followupElementModel, followupsModel} = require('../../models/followupsModel');
const gmailEmailsModel = require('../../models/gmailEmailsModel');

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

async function classifyFollowups(email1, email2, instruction){

    const message = instruction + " email1 : " + JSON.stringify(email1) + "/n email2 " + email2;

    console.log(message);
    const chat = model.startChat()

    const result = await chat.sendMessage(message);

    const response = await result.response.text();

    console.log("response recieved from model : ->"+ response);

    const responseJson = JSON.parse(response);
    console.log(responseJson);

    if(responseJson){
        const stringedResponse = JSON.stringify(responseJson);
        return {code: 201, response: stringedResponse};
    }else{
        console.log("Error in response for classifying")
        return {code: 404, response: "Error in response for classifying"};
    }
}

async function passThroughClassifyMails(email2, instruction, useruid) {
    try {
        const user = await UserModel.findOne({ useruid: useruid });

        const followups = await followupsModel.find({ participant: user._id }).populate({
            path: 'followup_history',
            populate: {
                path: 'reference',
                populate: {
                    path: 'email'
                }
            }
        });
        if(followups.length === 0){
            return {code: 500, response: "No followups found for user", followup_id: ""};
        }

        for (const followup of followups) {
            const emails = [];
            for (const element of followup.followup_history) {
            try {
                if (element.reference && element.reference.email) {
                console.log(element.reference.email);
                const email = await gmailEmailsModel.findById(element.reference.email).exec();
                if (email) {
                    emails.push({
                    from: email.from,
                    to: email.to,
                    subject: email.subject,
                    message: email.message,
                    timestamp: email.timestamp
                    });

                    console.log(email.message)
                }
                }
            } catch (error) {
                console.error(error);
                return {code: 404, response: "Error in fetching emails", followup_id: ""};
            }
            }
            const response = await classifyFollowups(emails, email2, instruction);
            console.log("testing0 : " + response.response);
            if(response.code === 201){
                const jsonResponse = JSON.parse(response.response);
                console.log("jsonified" + jsonResponse)
                if(jsonResponse.isUpdate === true){
                return {code: 201, response: response.response, followup_id: followup._id};
                }
            }
        }
    } catch (error) {
        console.error(error);
        return {code: 404, response: "Error in passThroughClassifyMails", followup_id: ""};
    }

    return {code: 404, response: "No followups found for user", followup_id: ""};
}


async function shouldFollowuped(email, instruction){

    const message = instruction + " email1 : " + JSON.stringify(email);

    console.log(message);
    const chat = model.startChat()

    const result = await chat.sendMessage(message);

    const response = await result.response.text();

    console.log("response recieved from model : ->"+ response);

    const responseJson = JSON.parse(response);
    console.log(responseJson);

    if(responseJson){
        const stringedResponse = JSON.stringify(responseJson);
        return {code: 201, response: stringedResponse};
    }else{
        console.log("Error in response for classifying")
        return {code: 404, response: "Error in response for classifying"};
    }
}


module.exports =  {classifyFollowups , passThroughClassifyMails, shouldFollowuped};
