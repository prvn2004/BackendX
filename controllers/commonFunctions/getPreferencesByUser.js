const UserModel = require('../../models/UserModel');
const preferencesModel = require('../../models/preferencesModel');

async function getPreferencesByUser(userId, desiredPreference) {
    try {
        const user = await UserModel.findById(userId).exec();
            const preferences = await preferencesModel.findOne({ user: user._id }).exec();
            if (!preferences) {
                console.error('Preferences not found for user:', userId);
                
            }
            const isAuthorizedPreference = preferences.preferences.find(preference => preference.valueName === "is_authorized");
            if (!isAuthorizedPreference) {
                console.error('is_authorised preference not found for user:', userId);
            }
            const isAuthorized = Boolean(isAuthorizedPreference.value);
            if (!isAuthorized) {
                console.log(`User ID ${userId} is not authorized. Skipping...`);
            }

            const intervalPreference = preferences.preferences.find(preference => preference.valueName === desiredPreference);
            if (!intervalPreference) {
                console.error('Interval preference not found for user:', userId);
            }

            return intervalPreference;
    }
      catch (error) {
        console.error('Error processing user ID:', userId, error);
    }
}

module.exports = getPreferencesByUser;