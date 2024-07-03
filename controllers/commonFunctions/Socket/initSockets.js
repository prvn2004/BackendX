const { getNotifications, deleteSentNotifications } = require('../Notifications/notificationRedisFunctions');
const  {newMessage, getAllMessages}  = require('../../../controllers/newMessage');

const connectedUsers = {};

async function initSockets(socket, io) {
    // listen for the init function sent by the client
    socket.on("init", async (_id) => {
        connectedUsers[_id] = socket.id;

        // if the user is authenticated, get the user's initial notifications
        try {
            const message = await getNotifications(_id);
            socket.emitWithAck("pendingNotifications", {
                message,
            }, (ack) => {
                if (ack) {
                    console.log("Acknowledgement received:", ack);
                    deleteSentNotifications();
                } else {
                    console.log("No acknowledgement received.");
                }
            }, 5000);
        } catch (error) {
            console.log("Error:", error);
        }
    });

    socket.on('newMessage', async (message) => {
        console.log('message: ' + message);

        try {
            const responsei = await newMessage(message);
            await new Promise((resolve, reject) => {
                socket.emitWithAck("newMessage", responsei.status, responsei.message, { timeout: 10000 }, (ack) => {
                });
            });
        } catch (error) {
            console.log('Error:', error);
        }
    });

    socket.on('getAllMessages', async (chatId) => {
        console.log('chatId: ' + chatId);

        try {
            const response = await getAllMessages(chatId);
            await new Promise((resolve, reject) => {
                socket.emitWithAck("getAllMessages", response.status, response.messages, { timeout: 10000 }, (ack) => {
                });
            });
        } catch (error) {
            console.log('Error:', error);
        }
    });



    socket.on('disconnect', () => {
        for (const userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
        console.log('user disconnected');
    });
}

module.exports = {initSockets, connectedUsers};

