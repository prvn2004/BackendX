const { google } = require('googleapis');

async function getAccessTokenFromRefreshToken(refreshToken){
  
  const oAuth2Client = new google.auth.OAuth2(
    "547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com",
    "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",
    "http://localhost:3000/oauth2callback"
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  return new Promise((resolve, reject) => {
    oAuth2Client.refreshAccessToken((err, tokens) => {
        if (err) {
            reject(err);
        } else {
            resolve(tokens.access_token);
        }
    });
});
}


module.exports = getAccessTokenFromRefreshToken;