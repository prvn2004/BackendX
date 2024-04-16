const express = require('express');
const {ReferenceModel,
    followupElementModel,
    followupsModel } = require('../models/followupsModel');
const UserModel = require('../models/UserModel');
const MessageModel = require('../models/messageModel');
const gmailEmailModel = require('../models/gmailEmailsModel');

const router = express.Router();

// GET all followupModels by participantId
router.get('/getall/:participantId', async (req, res) => {
    try {
        console.log('GET /getall/:participantId')
        const participantId = req.params.participantId;
        const user = await UserModel.findOne({ useruid: participantId }).exec();
        const followupModels = await followupsModel.find({ participant: user._id });

    const modifiedFollowupModels = await Promise.all(followupModels.map(async (followup) => {
        const mostRecentMessage = await MessageModel.findOne({ _id: followup.autoResponses[followup.autoResponses.length - 1] }).exec();
        const modifiedFollowup = { ...followup.toObject(), title: mostRecentMessage.content };

        const followupElementIds = followup.followup_history;
        const followupElements = await followupElementModel.find({ _id: { $in: followupElementIds } }).exec();
        const referenceIds = followupElements.map(followupElement => followupElement.reference);
        const references = await ReferenceModel.find({ _id: { $in: referenceIds } }).exec();
        const messageIds = references.map(reference => reference.email);
        const messages = await gmailEmailModel.find({ _id: { $in: messageIds } }).exec();

        modifiedFollowup.referenceMail = messages.map(message => ({
            from: message.from,
            subject: message.subject,
            date: message.internalDate
        }));

        return modifiedFollowup;
    }));

        res.json(modifiedFollowupModels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;