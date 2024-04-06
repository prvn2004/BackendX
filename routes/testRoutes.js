const express = require('express');
const  getMails  = require('../controllers/commonFunctions/getMails');
const User = require('../models/UserModel');
const tokensModel = require('../models/TokensModel');
const getAccessTokenFromRefreshToken = require('../controllers/commonFunctions/getAccessTokenFromRefreshToken');
const getRefreshToken = require('../controllers/commonFunctions/getRefreshToken');

const router = express.Router();
router.use(express.json());

router.post('/mails', (req, res) => {
    const _id = req.body._id;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    // Run the getMails function here
    getMails(_id, startDate, endDate);


    // Send a response back to the client
    res.send('Mails retrieved successfully');
});

router.post('/getaccesstoken', async (req, res) => {

    try {

        // console.log("new test" + participantId)
        // Get user from UserModel using participantId
        const user = await User.findOne({ useruid: req.body.participantId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Get refreshToken from tokensModel using user._id
        const refreshToken = await getRefreshToken(user._id);

        if (!refreshToken) {
            return res.status(404).send('Refresh token not found');
        }

        const accessToken = await getAccessTokenFromRefreshToken(refreshToken);

        // Send the access token back to the client
        res.send(accessToken);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;