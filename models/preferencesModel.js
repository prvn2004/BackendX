const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
    },
    preferenceName: {
        type: String,
        required: true,
    },
    valueName: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true,
    },
});

const preferencesModelSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
    },
    preferences: {
        type: [preferencesSchema],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const PreferencesModel = mongoose.model('PreferencesModel', preferencesModelSchema);

module.exports = PreferencesModel;
