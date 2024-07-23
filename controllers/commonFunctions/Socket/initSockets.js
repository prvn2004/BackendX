const { getNotifications, deleteSentNotifications } = require('../Notifications/notificationRedisFunctions');
const  {newMessage} = require('../../../controllers/newMessage');
const {getAllMessages} = require('../../../controllers/newMessage');
const dailyDigest = require('../../../controllers/gemini/DailyDigest');

const connectedUsers = {};

// let ios;

async function initSockets(socket, io) {
    ios = io;
    socket.on("init", async (_id) => {
        connectedUsers[_id] = socket.id;

        try {
            const message = await getNotifications(_id);
            socket.emitWithAck("pendingNotifications", {
                message,
            }, (ack) => {
                if (ack) {
                    //console.log("Acknowledgement received:", ack);
                    deleteSentNotifications();
                } else {
                    //console.log("No acknowledgement received.");
                }
            }, 5000);
        } catch (error) {
            //console.log("Error:", error);
        }
    });

    socket.on('newMessage', async (message) => {
        //console.log('message: ' + message);

        try {
            const responsei = await newMessage(message);
            await new Promise((resolve, reject) => {
                socket.emitWithAck("newMessage", responsei.status, responsei.message, { timeout: 10000 }, (ack) => {
                });
            });
        } catch (error) {
            //console.log('Error:', error);
        }
    });

    socket.on('getAllMessages', async (chatId) => {
        //console.log('chatId: ' + chatId);

        try {
            const response = await getAllMessages(chatId);
            await new Promise((resolve, reject) => {
                socket.emitWithAck("getAllMessages", response.status, response.messages, { timeout: 10000 }, (ack) => {
                });
            });
        } catch (error) {
            //console.log('Error:', error);
        }
    });

    const demoData = [
        {
            subject: "Welcome to our platform",
            body: "Thank you for joining our platform. We hope you have a great experience! Here are some details about our platform:\n\n- Features: Our platform offers a wide range of features to enhance your experience. From personalized recommendations to advanced search filters, we have it all.\n\n- Community: Join our vibrant community of users who share similar interests. Connect with like-minded individuals and explore new opportunities.\n\n- Support: Our dedicated support team is available 24/7 to assist you with any queries or issues you may have. Feel free to reach out to us anytime.\n\nWe value your presence on our platform and look forward to serving you.",
            email: "john.doe@example.com"
        },
        {
            subject: "Important Announcement",
            body: "We have an important announcement to share with you. Please read the details carefully.\n\n- Date: Monday, September 20th\n- Time: 3:00 PM\n- Location: Conference Room A\n\nThis announcement is regarding a major update to our platform. We will be introducing new features and improvements to enhance your experience. Your feedback and suggestions have been instrumental in shaping these changes. We appreciate your continued support and look forward to your participation in this exciting update.\n\nIf you have any questions or concerns, please don't hesitate to reach out to us. Thank you for being a valued member of our community.",
            email: "jane.smith@example.com"
        },
        {
            subject: "Your Amazon Order",
            body: "Your order has been shipped and will be delivered on Monday. Here is your tracking number: ABC123456789.\n\n- Order Details:\n  - Item: XYZ Product\n  - Quantity: 1\n  - Price: $99.99\n\nWe hope you enjoy your purchase. If you have any questions or need further assistance, please feel free to contact our customer support team. Thank you for choosing Amazon!",
            email: "customer@example.com"
        },
        {
            subject: "Meeting Reminder",
            body: "Just a reminder that we have a meeting tomorrow at 10:00 AM. Please make sure to be on time.\n\n- Meeting Details:\n  - Date: Tuesday, September 21st\n  - Time: 10:00 AM\n  - Location: Conference Room B\n\nAgenda:\n- Review project progress\n- Discuss upcoming milestones\n- Address any blockers or challenges\n\nYour presence and active participation are crucial for the success of this meeting. If you have any questions or conflicts, please let us know as soon as possible. We look forward to productive discussions and moving the project forward.",
            email: "employee@example.com"
        },
        {
            subject: "Upcoming Event",
            body: "Don't forget about the upcoming event this weekend. We look forward to seeing you there!\n\n- Event Details:\n  - Date: Saturday, September 25th\n  - Time: 6:00 PM\n  - Location: Central Park\n\nActivities:\n- Live music performances\n- Food stalls offering a variety of cuisines\n- Games and entertainment for all ages\n\nBring your friends and family along for a fun-filled evening. Don't miss out on this exciting event. If you have any questions or need more information, please feel free to reach out to us. See you soon!",
            email: "event@example.com"
        }
    ];

    // socket.on('DailyDigest', async (message) => {
    //     //console.log('message: ' + message);

    //     try {
    //         const response = await dailyDigest(demoData);
    //         const { status, result } = response;

    //         if (status === 500) {
    //             //console.log('Error:', result);
    //         } else if (status === 201) {
    //             await new Promise((resolve, reject) => {
    //                 socket.emitWithAck("DailyDigest", status, result.response, { timeout: 10000 }, (ack) => {
    //                 });
    //             });
    //         }
    //     } catch (error) {
    //         //console.log('Error:', error);
    //     }
    // });



    socket.on('disconnect', () => {
        for (const userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
        //console.log('user disconnected');
    });
}

// id = 10 for this example
// async function emitMessage(event_name, _id, message) {
//     if (!ios || !ios.sockets || !ios.sockets.sockets) {
//         console.warn("Invalid socket configuration.");
//         return;
//     }

//     if (!_id) {
//         console.warn("Invalid user ID.");
//         return;
//     }

//     const socket_id = connectedUsers[_id];
//     if (!socket_id) {
//         console.warn(`Socket ID not found for user ID ${_id}.`);
//         return;
//     }

//     const socket = ios.sockets.sockets.get(socket_id);
//     if (!socket) {
//         console.warn(`Socket with ID ${socket_id} not found.`);
//         return;
//     }

//     socket.emit(event_name, message);
// }


module.exports = {initSockets, connectedUsers};

