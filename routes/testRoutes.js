const express = require('express');
const  getMails  = require('../controllers/commonFunctions/testmails');
const User = require('../models/userModel');
const getAccessTokenFromRefreshToken = require('../controllers/commonFunctions/getAccessTokenFromRefreshToken');
const getRefreshToken = require('../controllers/commonFunctions/getRefreshToken');
const instruction = require('../controllers/gemini/instructions');

const getRefreshTokenFromAuthCode = require('../controllers/getRefreshTokenFromAuthCode');
const {processInstruction , passThroughClassifyMails, shouldFollowuped} = require('../controllers/gemini/classifyFollowup');

const sendChatNotification = require('../firebase/sendNotification');
const {processData} = require('../controllers/gemini/geminiAutomationLib/automation');
const {newMessage} = require('../controllers/newMessage');

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

        // //console.log("new test" + participantId)
        // Get user from userModel using participantId
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

        //console.log(email2)

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

router.post('/shouldfollowuped', async (req, res) => {
    try {
        // const emails = req.body.map(obj => obj.email);
        const emails = req.body
        const instruct = instruction.DAILY_EMAIL_DIGEST;

        const results = [];
            const result = await processInstruction(emails, instruct);
            results.push(result);

        res.send(results);
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
        //console.log(JSON.parse(JSON.stringify(error)));
        res.status(500).send('Internal Server Error');
    }
});

router.post('/newMessage', async (req, res) => {
    try {
        // const input = req.body.input

        const messageData = {
            "participantId": "T91iN72VnicpJDES3r2bM6TJQ9j1", 
            "query": {
              "chatId": "",
              "content": "hey bro",
              "isBot": false
            }
          };


        const messageString = JSON.stringify(messageData);

        const responsei = await newMessage(messageString);

        // const Main_prompt = instruction.TESTING;

        // const results = await processData(Main_prompt, input, null, 0, null);

        res.status(201).send(responsei);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;