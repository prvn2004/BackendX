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
        console.log(req.body);
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
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById({_id: req.params.id});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    console.log(id, body);

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
