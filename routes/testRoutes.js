const express = require('express');
const  getMails  = require('../controllers/commonFunctions/testmails');
const User = require('../userModel');
const getAccessTokenFromRefreshToken = require('../controllers/commonFunctions/getAccessTokenFromRefreshToken');
const getRefreshToken = require('../controllers/commonFunctions/getRefreshToken');
const instruction = require('../controllers/gemini/instructions');

const getRefreshTokenFromAuthCode = require('../controllers/getRefreshTokenFromAuthCode');

const sendChatNotification = require('../firebase/sendNotification');

const router = express.Router();
router.use(express.json());

router.post('/mails', (req, res) => {
    const _id = req.body._id;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    // Run the getMails function here
    getMails(_id, startDate, endDate, 'output.csv');


    // Send a response back to the client
    res.send('Mails retrieved successfully');
});

router.post('/getaccesstoken', async (req, res) => {

    try {

        // console.log("new test" + participantId)
        // Get user from UserModel using participantId
        // const user = await User.findOne({ useruid: req.body.participantId });

        // if (!user) {
        //     return res.status(404).send('User not found');
        // }

        // // Get refreshToken from tokensModel using user._id
        // const refreshToken = await getRefreshToken(user._id);

        // if (!refreshToken) {
        //     return res.status(404).send('Refresh token not found');
        // }

        const accessToken = await getAccessTokenFromRefreshToken(req.body.refreshToken);

        // Send the access token back to the client
        res.send(accessToken);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/newnotification', async (req, res) => {   
    try {

        const response = await sendChatNotification(req.body.userId, req.body.chatnotificationCategory, req.body.messageData);

        // Send the response back to the client
        res.send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/classifyfollowup', async (req, res) => {
    try {
        // const { email1, email2 } = req.body;

        const email2 = req.body.email2;

        console.log(email2)

        const useruid = "T91iN72VnicpJDES3r2bM6TJQ9j1"

        const instruct = instruction.ISSAMECLASSIFY;
        // const result = await classifyFollowups(email1, email2, instruct);

        const result = await passThroughClassifyMails(email2, instruct,  useruid)

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/getrefreshtoken', async (req, res) => {
    try {
        const authCode = req.body.authCode;

        const refreshToken = await getRefreshTokenFromAuthCode(authCode);

        res.send(refreshToken);
    } catch (error) {
        console.log(JSON.parse(JSON.stringify(error)));
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;