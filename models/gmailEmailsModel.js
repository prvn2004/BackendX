const mongoose = require('mongoose');

// // Define the Header sub-schema
// const headerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   value: { type: String},
// });

// Define the main email schema
const emailSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId, auto: true},
  id: { type: String, required: true },
  labelIds: [String],
  to: { type: String, required: true },
  from: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  internalDate: { type: String, required: true },
  // payload: String, // payload is main message text
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

// Create the Mongoose model
const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
