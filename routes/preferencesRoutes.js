// const express = require('express');
// const preferenceModel = require('../models/preferenceModel');

// const router = express.Router();
// router.use(express.json());

// // Create new preference
// router.post('/', (req, res) => {
//     const newPreference = req.body;
//     preferenceModel.create(newPreference)
//         .then((createdPreference) => {
//             res.status(201).json(createdPreference);
//         })
//         .catch((error) => {
//             res.status(500).json({ error: 'Failed to create preference' });
//         });
// });

// // Get preferences by participantId
// router.get('/:participantId', async (req, res) => {
//     try {
//         const participantId = req.params.participantId;
//         const user = await userModel.findOne({ useruid : participantId });
//         if (user) {
//             const preferences = await preferenceModel.findOne({ user: user._id });
//             if (preferences) {
//                 res.status(200).json(preferences);
//             } else {
//                 res.status(404).json({ error: 'Preferences not found' });
//             }
//         } else {
//             res.status(404).json({ error: 'User not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to get user or preferences' });
//     }
// });

// // Add preference to model class using participantId
// router.post('/:participantId', (req, res) => {
//     const participantId = req.params.participantId;
//     const newPreference = req.body;
//     preferenceModel.findOneAndUpdate({ participantId }, newPreference, { new: true })
//         .then((updatedPreference) => {
//             if (updatedPreference) {
//                 res.status(200).json(updatedPreference);
//             } else {
//                 res.status(404).json({ error: 'Preference not found' });
//             }
//         })
//         .catch((error) => {
//             res.status(500).json({ error: 'Failed to add preference' });
//         });
// });

// // Update preference using participantId
// router.put('/preferences/:participantId', (req, res) => {
//     const participantId = req.params.participantId;
//     const updatedPreference = req.body;
//     preferenceModel.findOneAndUpdate({ participantId }, updatedPreference, { new: true })
//         .then((updatedPreference) => {
//             if (updatedPreference) {
//                 res.status(200).json(updatedPreference);
//             } else {
//                 res.status(404).json({ error: 'Preference not found' });
//             }
//         })
//         .catch((error) => {
//             res.status(500).json({ error: 'Failed to update preference' });
//         });
// });

// // Delete preference using participantId
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

// module.exports = router;