/**
 * @api {post} /users Create a new user
 * @api {get} /users Get all users
 * @api {get} /users/:id Get a single user by ID
 * @api {put} /users/:id Update a user by ID
 * @api {delete} /users/:id Delete a user by ID
 */

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    //console.log(req.body);
    const existingUser = await User.findOne({ useremail: req.body.useremail });
    if (existingUser) {
      return res.status(201).json(existingUser);
    }
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get a single user by ID
router.get('/:participantId', async (req, res) => {
  try {
    const user = await User.findOne({ useruid: req.params.participantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by participantId
router.put('/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const { body } = req;

    //console.log(participantId, body);

    const updatedUser = await User.findOneAndUpdate({ useruid: participantId }, body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by participantId
router.delete('/:participantId', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ useruid: req.params.participantId });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
