const gmailEmailsModel = require('../../models/gmailEmailsModel');

async function saveMessagesToDatabase(message) {
    try {
        const existingMessage = await gmailEmailsModel.findOne({ id: message.id }).exec();
        if (existingMessage) {
            console.log('Message already exists in the database. Skipping...');
            return;
        }
        const newMessage = new gmailEmailsModel(message);
        await newMessage.save();

        console.log('Message saved to database successfully!');
    } catch (error) {
        console.error('Error saving message to database:', error);
    }
}

module.exports = saveMessagesToDatabase;