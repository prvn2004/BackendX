const userModel = require('../models/userModel');
const preferencesModel = require('../models/preferencesModel');
const preferencesNameConstants = require('./preferencesNameConstants');
const getPreferencesByUser = require('../controllers/commonFunctions/getPreferencesByUser');

async function getFCMTokenByID(id) {
        const user = await userModel.findOne({useruid: id}).exec();
        const preference = await getPreferencesByUser(user._id, preferencesNameConstants.FCM_TOKEN);

        if(preference) {
            return preference.value
        }else {
            error = "User's token doesnt exist"
        }
}

module.exports = getFCMTokenByID; 