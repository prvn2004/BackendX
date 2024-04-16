const { google } = require('googleapis');
/**
 * Retrieve the refresh token from the authorization code.
 *
 * @param {string} authCode The authorization code received from the OAuth2 flow.
 * @returns {Promise<string>} The refresh token.
 */
async function getRefreshTokenFromAuthCode(authCode) {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            "547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com",
            "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",
            "http://localhost:3000/oauth2callback"
        );

        const { tokens } = await oAuth2Client.getToken(authCode);
        console.log('Refresh Token Response:', tokens);
        
        return tokens.refresh_token;
    } catch (error) {
        console.error("Error retrieving refresh token:", error);
        throw error;
    }
}

module.exports = getRefreshTokenFromAuthCode;