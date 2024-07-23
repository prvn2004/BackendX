const Agenda = require('agenda');
const MongoClient = require('mongodb').MongoClient;
const getMails = require('./controllers/commonFunctions/getMails');
const getUserIds = require('./controllers/commonFunctions/getUserIds');
const mongoose = require('mongoose');
const preferencesModel = require('./models/preferencesModel');
const userModel = require('./models/userModel');
const gmailEmailModel = require('./models/gmailEmailsModel');
const getPreferencesByUser = require('./controllers/commonFunctions/getPreferencesByUser');

mongoose.connect("mongodb+srv://prvn:prvn2004@mernapp.wh18ryw.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        //console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

// Replace with your actual MongoDB connection details
const mongoConnectionString = 'mongodb+srv://prvn:prvn2004@mernapp.wh18ryw.mongodb.net/?retryWrites=true&w=majority'; 

const agenda = new Agenda({ db: { address: mongoConnectionString} });

// Define your 'getMail' function (replace with your mail fetching logic)
async function getMail() {
    //console.log('Fetching mail...');

    try {
        //console.log('recieving emails...');
        // Get all users and create a list of their ids
        const users = await userModel.find();
        const userIds = users.map(user => user._id.toString());
    
        // Iterate over the user IDs and process each one
        for (const userId of userIds) {
          //console.log(`Processing user ID: ${userId}`);
        try {
            const user = await userModel.findById(userId).exec();

            const intervalPreference = await getPreferencesByUser(userId, "interval");

            const intervalValue = parseInt(intervalPreference.value);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1); // Add 1 day to the endDate
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - intervalValue);

            //console.log(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);

            const sDate = startDate.toISOString().split('T')[0]
            const eDate = endDate.toISOString().split('T')[0]
            const query = `is:unread after:${sDate} before:${eDate}`
            // const query = `after:${sDate} before:${eDate}`

            await getMails(userId, user.useruid, query);
            //console.log(`Emails sent for user ID: ${userId}`);
        } catch (error) {
            console.error('Error processing user ID:', userId, error);
            continue;
        }
        }
    
        return 'Emails sent successfully';
      } catch (error) {
        // Log the error and continue processing the next job
        console.error('Error sending emails:', error);
        throw error;
      }
}

    agenda.define('getMail', async (job) => {
    //console.log('Job started:', job.attrs.name);
    await getMail();
    //console.log('Job completed:', job.attrs.name);
    })

    agenda.define('deleteOldMails', async (job) => {
        //console.log('Job started:', job.attrs.name);
    
        try {
            // Get all users and create a list of their ids
            const users = await userModel.find();
            const userIds = users.map(user => user._id.toString());
    
            // Iterate over the user IDs and process each one
            for (const userId of userIds) {
                //console.log(`Processing user ID: ${userId}`);
                try {
                    const user = await userModel.findById(userId).exec();
                    const preferences = await preferencesModel.findOne({ user: user._id }).exec();
                    if (!preferences) {
                        console.error('Preferences not found for user:', userId);
                        continue;
                    }
                    const intervalPreference = preferences.preferences.find(preference => preference.valueName === "interval");
                    if (!intervalPreference) {
                        console.error('Interval preference not found for user:', userId);
                        continue;
                    }
                    const intervalValue = parseInt(intervalPreference.value);
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() - intervalValue + 1);
    
                    //console.log('Deleting mails older than:', endDate.toISOString().split('T')[0]);

                    //console.log('Deleting mails older than:', endDate.getTime());
                    try {
                        await gmailEmailModel.deleteMany({ user: userId, internalDate: { $lt: endDate.getMilliseconds() } });
                        //console.log(`Mails deleted for user ID: ${userId}`);
                    } catch (error) {
                        console.error('Error deleting mails:', error);
                        continue;
                    }
                } catch (error) {
                    console.error('Error processing user ID:', userId, error);
                    continue;
                }
            }
    
            //console.log('Job completed:', job.attrs.name);
        } catch (error) {
            console.error('Error deleting old mails:', error);
            throw error;
        }
    });

// Start the Agenda service
setTimeout(async function () { 
    //console.log('Agenda service starting...');
    await agenda.start(); 
    //console.log('Agenda service started.');

    await agenda.every('10 minutes', 'getMail'); 
    //console.log('Job scheduled.');
    await agenda.every('0 23 * * *', 'deleteOldMails'); 
    //console.log('Job scheduled.');
}, 5000);

// Schedule the job
