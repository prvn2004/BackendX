const userModel = require('../../models/userModel');

async function getAllUserIds() {
    try {
        const users = await userModel.find();

        const userIds = users.map(user => user._id);

        return userIds;
    } catch (error) {
        console.error('Error retrieving user ids:', error);
        return []; 
    }
}


module.exports = getAllUserIds;