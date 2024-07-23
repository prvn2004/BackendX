const { google } = require('googleapis');

async function getAccessTokenFromRefreshToken(refreshToken){
  
  const oAuth2Client = new google.auth.OAuth2(
    "547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com",
    "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",
    "http://localhost:3000/oauth2callback"
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  return new Promise((resolve, reject) => {
    oAuth2Client.getAccessToken((err, token) => {
      if (err) {

        oAuth2Client.refreshAccessToken((err, tokens) => {
          if (err) {
            //console.log('Error refreshing access token:', err);
            return;
          }
        
          // The new access token is now available in `tokens.access_token`
          //console.log('New access token:', tokens.access_token);
        });
        reject(err);
        return;
      }
      resolve(token);
    });
  });
}


module.exports = getAccessTokenFromRefreshToken;