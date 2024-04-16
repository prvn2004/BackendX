const mongoose = require('mongoose');

// Define the ReferenceModel schema
const referenceSchema = new mongoose.Schema({
    email: {
        type: String
    }
});

// Define the followupElement schema
const followupElementSchema = new mongoose.Schema({
    _id: { 
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    entities: {
        type: [String]
    },
    //here reference to be added to other data structure type for later use.
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferenceModel'
    }
});



// Define the followupsModel schema
const followupsSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    followup_history: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'followupElement'
        }],
        default: []
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    autoResponses: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MessageModel'
        }],
        default: []
    }
});

// Create the models
const ReferenceModel = mongoose.model('ReferenceModel', referenceSchema);
const followupElementModel = mongoose.model('followupElement', followupElementSchema);
const followupsModel = mongoose.model('followupsModel', followupsSchema);

module.exports = {
    ReferenceModel,
    followupElementModel,
    followupsModel
};