const userModel = require('../userModel');

async function chatTemplatePlaceholder(type, template, messageData, senderId){
    const userDetailsFetched = await userModel.findOne({useruid: senderId}).exec()

    const name = userDetailsFetched.username
    
    const replaceUserNameTemplates = type.replace(/%Name%/g, name)

    let replaceMessageTemplates 
    if(messageData){
     replaceMessageTemplates = messageData.replace(/%MessageData%/g, messageData)
    }else{
        replaceMessageTemplates = template
    }

    const chatTemplateData = [replaceUserNameTemplates, replaceMessageTemplates]

    return chatTemplateData
}

module.exports = chatTemplatePlaceholder;