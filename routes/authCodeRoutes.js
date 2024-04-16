const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
router.use(express.json());
const saveRefreshToken = require('../controllers/getRefreshTokenFromAuthCode');
const AuthCode = require('../models/oauthModel');
const getRefreshTokenFromAuthCode = require('../controllers/getRefreshTokenFromAuthCode');
const getAccessTokenFromRefreshToken = require('../controllers/commonFunctions/getAccessToken');
const Tokens = require('../models/tokensModel');
const getPreferencesByUser = require('../controllers/commonFunctions/getPreferencesByUser');
const getMails = require('../controllers/commonFunctions/getMails');

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

        const refresh_token = await getRefreshTokenFromAuthCode(req.body.authCode);
        const token = new Tokens({
            user: user._id,
            refreshToken: refresh_token,
        });

        await token.save();
        console.log(refresh_token);

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