const tokenModel = require('../../models/TokensModel');
const oauthModel = require('../../models/OAuthModel');
const getRefreshTokenFromAuthCode = require('../getRefreshTokenFromAuthCode');

async function getRefreshToken(_id) {
    try {
        const token = await tokenModel.findOne({ user:  _id}).exec();
        console.log("token" + token);
        let newRefreshToken;

        if (!token) {
            console.log('Token not found, trying to get new token using auth code');
            const authCodei = await oauthModel.findOne({ user: _id }).exec();
            console.log("authCode" + authCodei);
            if (!authCodei) {
                console.log('Auth code not found');
                throw new Error('Auth code not found');
            }
            newRefreshToken = await getRefreshTokenFromAuthCode(authCodei.authCode);

            return newRefreshToken;
        }
        //  else {
        //     const currentTime = new Date();
        //     const tokenTimestamp = token.timestamp;
        //     const timeDifference = currentTime - tokenTimestamp;
        //     const minutesDifference = Math.floor(timeDifference / (1000 * 60));

        //     if (minutesDifference >= 60) {
        //         const authCode = await oauthModel.find({ user: _id }).select('authCode');
        //         if (!authCode) {
        //             console.log('Auth code not found');
        //             throw new Error('Auth code not found');
        //         }
        //         newRefreshToken = await getRefreshTokenFromAuthCode(authCode);
        //     } else {
        //         return token.refreshToken;
        //     }
        // }

        // if(!newRefreshToken){ 
        //     console.log('Failed to get refresh token');
        //     throw new Error('Failed to get refresh token')}

        // const newToken = new tokenModel({
        //     user: _id,
        //     refreshToken: newRefreshToken
        // });
        // await newToken.save();
        console.log('Refresh Token:', token.refreshToken);

        return token.refreshToken;
    } catch (error) {
        console.error(error); // Log the error to debug
        throw new Error('Failed to get refresh token');
    }
}

module.exports = getRefreshToken;
