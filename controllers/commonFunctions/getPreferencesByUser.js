const userModel = require('../../models/userModel');
const preferencesModel = require('../../models/preferencesModel');

async function getPreferencesByUser(userId, desiredPreference) {
    try {
        const user = await userModel.findById(userId).exec();
        const userPreferences = await preferencesModel.findOne({ user: user._id }).exec();
        
        if (!userPreferences) {
            console.error('Preferences not found for user:', userId);
        }
        
        // const isAuthorizedPreference = userPreferences.preferences.find(preference => preference.valueName === "is_authorized");
        
        // if (!isAuthorizedPreference) {
        //     //console.log('is_authorized preference not found for user:', userId);
        // }
        
        // const isAuthorized = Boolean(isAuthorizedPreference.value);
        
        // if (!isAuthorized) {
        //     //console.log(`User ID ${userId} is not authorized. Skipping...`);
        // }

        const desiredPreferenceValue = userPreferences.preferences.find(preference => preference.valueName === desiredPreference);
        
        if (!desiredPreferenceValue) {
            console.error('Desired preference not found for user:', userId);
        }

        return desiredPreferenceValue;
    } catch (error) {
        console.error('Error processing user ID:', userId, error);
    }
}

module.exports = getPreferencesByUser;