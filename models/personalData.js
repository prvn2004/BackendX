const { unique } = require('agenda/dist/job/unique');
const mongoose = require('mongoose');

const personalDataSchema = new mongoose.Schema({
    history: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    timeline: {
        type: String,
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const PersonalData = mongoose.model('PersonalData', personalDataSchema);

module.exports = PersonalData;