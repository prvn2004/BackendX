const chatNotificationCategories = require('./chatNotificationCategories')
const chatTemplatePlaceholder = require('./metaDataReplacer')
const { promisify } = require('util'); // Import the promisify function from the util module

const getFcmTokenByID = require('./getFcmTokenByID')
const {firebase} = require('./firebaseInitialiser')

async function sendChatNotification(userId, chatnotificationCategory, messageData){
    const {type, template} = chatNotificationCategories[chatnotificationCategory]

    const userToken = await getFcmTokenByID(userId)

    //console.log("User Token", userToken)

    const [chatTemplateData] = await Promise.all([
        chatTemplatePlaceholder(type, template, messageData, userId)
    ])

    let message = {
        token: "eNi1NQS5QrSzQy_NsXeIEL:APA91bHbwOpKS47z1BBBXcuM7vzLso76vFMg7m3-F4j7JHK4fclQfYIx4m25lZaIdUmemcFl5TTqn8uKU_PpTZI-xhebS4SX6C1tEkCJYqzm3VklVBUT4gsWWOOlPevqRF02Z14yahEF",
        notification: {
            title: chatTemplateData[0],
            body: chatTemplateData[1]
        },
    }

    //console.log("Message", message)

    try{
        const response = await firebase.messaging().send(message)
        //console.log("Successfully sent message", response)
    }
    catch(error){
        console.error("Error sending message", error)
    }
}

module.exports = sendChatNotification;
