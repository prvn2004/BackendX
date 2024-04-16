const gmailEmailsModel = require('../../models/gmailEmailsModel');
const {classifyFollowups, passThroughClassifyMails, shouldFollowuped} = require('../gemini/classifyFollowup');
const instruction = require('../gemini/instructions');
const {ReferenceModel,followupElementModel,followupsModel} = require('../../models/followupsModel');
const UserModel = require('../../models/UserModel');
const messageModel = require('../../models/messageModel');

const sendNotification = require('../../firebase/sendNotification');

async function saveMessagesToDatabase(message, useruid) {
    try {
        const existingMessage = await gmailEmailsModel.findOne({ id: message.id }).exec();
        if (existingMessage) {
            console.log('Message already exists in the database. Skipping...');
            return;
        }
        const newMessage = new gmailEmailsModel(message);
        await newMessage.save();

        const formatedmessage = "from : " + message.from + " to: "+ message.to + " message: " + message.message
        

        const response = await passThroughClassifyMails(formatedmessage, instruction.ISSAMECLASSIFY, useruid);

        if (response.code === 404) {
            console.log('Error in classifying the message:', response);
        }

        if (response.code === 201 || response.code === 500 || response.code === 404) {
            let jsonResponse = {isUpdate: false, summary: ""};
            if(response.code ===201){
            jsonResponse = JSON.parse(response.response);
            console.log("jsonified" + jsonResponse)
            }
            if(jsonResponse.isUpdate === true && response.code === 201){
                console.log(jsonResponse.isUpdate)
                const followupModelId = response.followup_id;
                // Create a new reference element

                const newMessageModel = new messageModel({
                    content: jsonResponse.summary,
                    isBot: true
                });

                await newMessageModel.save();

                const newReference = new ReferenceModel({
                    email: newMessage._id
                });
                await newReference.save();

                // Create a new followup element
                const newFollowupElement = new followupElementModel({
                    reference: newReference._id
                });
                  await newFollowupElement.save();

                // Push the new followup element _id into followup_history of followup model
                const followupModel = await followupsModel.findOne({ _id: followupModelId }).exec();
                followupModel.followup_history.push(newFollowupElement._id);
                followupModel.autoResponses.push(newMessageModel._id);
                await followupModel.save();

                await sendNotification(useruid, 'TEXT_MESSAGE', jsonResponse.summary);

            }
            else{
                const response1 = await shouldFollowuped(formatedmessage, instruction.SHOULD_FOLLOWUP);

                console.log("testing11" + response1);
    
                if(response1.code === 201){
                    const jsonResponse = JSON.parse(response1.response);
                    console.log("jsonified" + jsonResponse)
    
                    if(jsonResponse.shouldFollowuped === true ){
    
                        console.log(jsonResponse.shouldFollowuped)

                        const newMessageModel = new messageModel({
                            content: jsonResponse.summary,
                            isBot: true
                        });

                        await newMessageModel.save();
    
                        const newReference = new ReferenceModel({
                            email: newMessage._id
                        });
                        await newReference.save();
    
                        // Create a new followup element
                        const newFollowupElement = new followupElementModel({
                            reference: newReference._id
                        });
                        await newFollowupElement.save();
    
                        // Get the user _id from UserModel using useruid
                        const user = await UserModel.findOne({ useruid : useruid }).exec();
                        const userId = user._id;
    
                        // Create a new followup model
                        const newFollowupModel = new followupsModel({
                            participant: userId,
                            followup_history: [newFollowupElement._id],
                            autoResponses : [newMessageModel._id]
                        });
                        await newFollowupModel.save();

                        await sendNotification(useruid, 'TEXT_MESSAGE', jsonResponse.summary);

                    }
                }
            }
        }
        
        console.log('Message saved to database successfully!');
    } catch (error) {
        console.error('Error saving message to database:', error);
    }
}

module.exports = saveMessagesToDatabase;
