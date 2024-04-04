const {google} = require('googleapis');
const dotenv = require('dotenv');
const User = require('../models/UserModel');
const oauthModel = require('../models/OAuthModel');
const tokenModel = require('../models/tokensModel');

const axios = require('axios');

const oauthEndpoint = 'https://oauth2.googleapis.com/token';
const clientId = "547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com";
const clientSecret = "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";
const redirectUri = "http://localhost:3000/oauth2callback";

async function makeApiCall(user, authCode) {
  try {
    const params = new URLSearchParams();
    params.append('code', authCode);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('access_type', 'offline');
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const response = await axios({
      method: 'post',
      url: oauthEndpoint,
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Access Token Response:', response.data);

    await tokenModel.create({
      refreshToken: response.data.refresh_token,
      accessToken: response.data.access_token,
      user: user._id
    });
  } catch (error) {
    console.error('Token Exchange Error:', error);
    throw error;
  }
}

async function saveRefreshToken (userUid) {
  try {
    // Search for user using userUid
    const user = await User.findOne({ useruid: userUid });

    if (user) {
      const authCode = await oauthModel.findOne({ user: user._id });

      makeApiCall(user, authCode.authCode);

    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

}

// async function getAccessTokenUsingRefreshToken(refresh_token) {
//   try {
//     oauth2Client.setCredentials({
//       refresh_token: refresh_token
//     });

//     const accessToken = oauth2Client.getAccessToken()
//     return accessToken;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

module.exports = saveRefreshToken;