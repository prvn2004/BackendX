/**
 * @datastructure for user model
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true, required: true },
    useruid: { type: String, required: true, unique: true},
    username: { type: String, required: true },
    userimage: { type: String, required: false },
    useremail: { type: String, required: true , unique: true},
});

module.exports = mongoose.model('User', userSchema);
