const { google } = require('googleapis');
const getRefreshToken = require('./getRefreshToken');
const getAccessToken = require('./getAccessToken');
const saveMailToDatabase = require('./saveMailsToDatabase');
const { simpleParser } = require('mailparser');

const getMessagesByDate = async (_id, startDate, endDate) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      "547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com",
      "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",
      "http://localhost:3000/oauth2callback"
    );

    const refreshToken = await getRefreshToken(_id);
    if (!refreshToken) {
      throw new Error('Failed to get a refresh token');
    }
    console.log('Refresh Token:', refreshToken);

    const accessToken = await getAccessToken(refreshToken);
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }
    console.log('Access Token:', accessToken);

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${startDate} before:${endDate}`
    });

    for (const message of messages.data.messages) {
      try {
        const messageData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'raw',
        });

        if (!messageData || !messageData.data || !messageData.data.raw) {
          console.error('No message data found');
          continue;
        }

        // Decode base64 data
        const decodedEmail = Buffer.from(messageData.data.raw, 'base64').toString('utf-8');

        // Parse the decoded email
        const parsedEmail = await simpleParser(decodedEmail);

        // Extract required information
        const to = parsedEmail.to ? parsedEmail.to.text : 'Unknown';
        const from = parsedEmail.from ? parsedEmail.from.text : 'Unknown';
        const subject = parsedEmail.subject ? parsedEmail.subject : 'No Subject';
        let messagepa = parsedEmail.text ? parsedEmail.text : 'No Message';

        // Remove links from message
        messagepa = messagepa.replace(/https?:\/\/\S+/g, '');

        // Replace multiple spaces with a single space
        messagepa = messagepa.replace(/\s+/g, ' ');

        const email = {
          id: messageData.data.id,
          labelIds: messageData.data.labelIds,
          to: to,
          from: from,
          subject: subject,
          internalDate: messageData.data.internalDate,
          message: messagepa,
          user: _id
        };

        if (email.labelIds.includes('CATEGORY_PROMOTIONS')) {
          console.log('Skipping saving mail with label CATEGORY_PROMOTIONS');
          continue;
        }

        console.log('To:', to);
        console.log('From:', from);
        console.log('Subject:', subject);

        await saveMailToDatabase(email);
      } catch (error) {
        console.error('Error parsing email:', error);
        // Move to the next iteration
        continue;
      }
    }
  } catch (error) {
    console.error('Error in getMessagesByDate:', error);
  }
};

module.exports = getMessagesByDate;
