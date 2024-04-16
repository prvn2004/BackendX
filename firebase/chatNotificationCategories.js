const {
    TEXT_MESSAGE,
    IMAGE,
    DOCUMENT,
    QUATITION
} = require('./notificationTypes');

const chatNotificationCategories = {
    [TEXT_MESSAGE]: {
        type : '%Name%',
        template: '%MessageData%'
    },
    [IMAGE]: {
        type : '%Name%',
        template: 'Sent a photo'
    },
    [DOCUMENT]: {
        type : '%Name%',
        template: 'Sent a document'
    },
    [QUATITION]: {
        type : '%Name%',
        template: '%MessageData%'
    }
}

module.exports = chatNotificationCategories;