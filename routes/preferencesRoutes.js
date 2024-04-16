const express = require('express');
const preferenceModel = require('../models/preferencesModel');

const router = express.Router();
router.use(express.json());
const userModel = require('../userModel');


// Save all preferences at once using participantId
router.post('/addmanypreferences/:participantId', async (req, res) => {
    try {
        const participantId = req.params.participantId;
        const newPreference = req.body;
        const user = await userModel.findOne({ useruid: participantId }).exec();
        if (user) {
            const preferences = await preferenceModel.findOne({ user: user._id }).exec();
            if (preferences) {
                newPreference.preferences.forEach((preference) => {
                    const existingPreference = preferences.preferences.find(p => p.valueName === preference.valueName);
                    if (existingPreference) {
                        existingPreference.value = preference.value;
                    } else {
                        preferences.preferences.push(preference);
                    }
                });
                await preferences.save();
                console.log('Updated Preferences:', preferences);
                res.status(200).json(preferences);
            } else {
                const newPreferences = new preferenceModel({ user: user._id, preferences: newPreference });
                await newPreferences.save();
                console.log('Created Preferences:', newPreferences);
                res.status(201).json(newPreferences);
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Failed to add preferences' });
    }
});

// Get all preferences using participantId
router.get('/getallpreferences/:participantId', async (req, res) => {
    try {
        const participantId = req.params.participantId;
        const user = await userModel.findOne({ useruid : participantId }).exec();
        if (user) {
            const preferences = await preferenceModel.findOne({ user: user._id }).exec();
            if (preferences) {
                res.status(200).json(preferences);
            } else {
                res.status(404).json({ error: 'Preferences not found' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user or preferences' });
    }
});

//update preference using preferenceId and participantId
router.post('/updatepreference/:participantId/:preferenceId', async (req, res) => {
    try {
        const participantId = req.params.participantId;
        const newPreference = req.body;
        const user = await userModel.findOne({ useruid: participantId }).exec();
        if (user) {
            const preferenceId = req.params.preferenceId;
            const preferences = await preferenceModel.findOne({ user: user._id }).exec();
            console.log('Preferences:', preferences);
            if (preferences) {
                const preference = preferences.preferences.find(p => p._id.toString() === preferenceId);
                console.log('Preference:', preference);
                if (preference) {
                    preference.preferenceName = newPreference.preferenceName;
                    preference.valueName = newPreference.valueName;
                    preference.value = newPreference.value;
                    await preferences.save();
                    console.log('Updated Preference:', preferences);
                    res.status(200).json(preference);
                } else {
                    preferences.preferences.push(newPreference);
                    await preferences.save();
                    console.log('Added Preference:', newPreference);
                    res.status(201).json(preferences);
                }
            } else {
                const newPreferences = new preferenceModel({ user: user._id, preferences: [newPreference] });
                await newPreferences.save();
                console.log('Created Preferences:', newPreferences);
                res.status(201).json(newPreferences);
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Failed to add preference' });
    }
});

// Add one preference into preferences using participantId
router.post('/addonepreference/:participantId', async (req, res) => {
    try {
        const participantId = req.params.participantId;
        const newPreference = req.body;
        const user = await userModel.findOne({ useruid: participantId }).exec();
        if (user) {
            const preferences = await preferenceModel.findOne({ user: user._id }).exec();
            if (preferences) {
                const existingPreference = preferences.preferences.find(p => p.valueName === newPreference.valueName);
                if (existingPreference) {
                    existingPreference.value = newPreference.value;
                } else {
                    preferences.preferences.push(newPreference);
                }
                await preferences.save();
                console.log('Updated Preferences:', preferences);
                res.status(200).json(preferences);
            } else {
                const newPreferences = new preferenceModel({ user: user._id, preferences: [newPreference] });
                await newPreferences.save();
                console.log('Created Preferences:', newPreferences);
                res.status(201).json(newPreferences);
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Failed to add preference' });
    }
});

// Delete preference using participantId
// router.delete('/preferences/:participantId', (req, res) => {
//     const participantId = req.params.participantId;
//     preferenceModel.findOneAndDelete({ participantId })
//         .then((deletedPreference) => {
//             if (deletedPreference) {
//                 res.status(200).json(deletedPreference);
//             } else {
//                 res.status(404).json({ error: 'Preference not found' });
//             }
//         })
//         .catch((error) => {
//             res.status(500).json({ error: 'Failed to delete preference' });
//         });
// });

module.exports = router;