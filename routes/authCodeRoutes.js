const express = require('express');
const User = require('../models/UserModel');
const router = express.Router();
router.use(express.json());
const saveRefreshToken = require('../controllers/oauth2');
const AuthCode = require('../models/OAuthModel');

// Create a new authCode
router.post('/', async (req, res) => {
    try {
        const user = await User.findOne({ useruid: req.body.user });
        if (!user) {
            console.log("user not found")
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(req.body);
        const existingAuthCode = await AuthCode.findOne({ user: user._id });
        if (existingAuthCode) {
            console.log("auth code already exists");
            return res.status(409).json({ error: 'AuthCode already exists' });
        }
        const authCode = new AuthCode({
            user: user._id,
            authCode: req.body.authCode,
        });
        await authCode.save();

        await saveRefreshToken(req.body.user);

        console.log("success")
        res.status(201).json(authCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single authCode by participantId
router.get('/:participantId', async (req, res) => {
    try {
        console.log(req.params.participantId);
        const user = await User.findOne({ useruid: req.params.participantId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const authCode = await AuthCode.findOne({ user: user._id });
        if (!authCode) {
            return res.status(404).json({ error: 'AuthCode not found' });
        }
        res.json(authCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update an authCode by participantId
router.put('/:participantId', async (req, res) => {
    try {
        const user = await User.findOne({ useruid: req.params.participantId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(user);
        
        const authCode = await AuthCode.findOneAndUpdate({ user: user._id }, req.body, {
            new: true,
        });
        if (!authCode) {
            return res.status(404).json({ error: 'AuthCode not found' });
        }
        res.json(authCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an authCode by participantId
router.delete('/:participantId', async (req, res) => {
    try {
        const user = await User.findOne({ useruid: req.params.participantId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const authCode = await AuthCode.findOneAndDelete({ user: user._id });
        if (!authCode) {
            return res.status(404).json({ error: 'AuthCode not found' });
        }
        res.json({ message: 'AuthCode deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;