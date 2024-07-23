const express = require('express');
const router = express.Router();
const Subscriber = require('../models/alphauserModel');

router.post('/alpha', async (req, res) => {
    console.log(req.body);
  const { email, deviceInfo } = req.body;

  try {
    const newSubscriber = new Subscriber({ email, deviceInfo });
    await newSubscriber.save();
    res.status(201).json({ message: 'Email added to waitlist successfully!' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ error: 'Email already exists in the waitlist.' });
    }
    res.status(500).json({ error: 'Failed to add email to waitlist.' });
  }
});


module.exports = router;