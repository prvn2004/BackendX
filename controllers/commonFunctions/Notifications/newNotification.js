const { addNotification } = require('../Notifications/notificationRedisFunctions');
const {io} = require('../../../server');

const newNotification = (socket, notification, socket_id) => {
    return new Promise((resolve, reject) => {
        socket.to(socket_id).emitWithAck("newNotification", {
            notification,
        }, (ack) => {
            try {
                if (ack) {
                    console.log("Acknowledgement received:", ack);
                    resolve(ack);
                } else {
                    console.log("No acknowledgement received. Calling deleteFunction...");
                    addNotification(notification);
                    resolve();
                }
            } catch (error) {
                console.error("Error occurred:", error);
                reject(error);
            }
        }, 5000);
    });
};

module.exports = newNotification;