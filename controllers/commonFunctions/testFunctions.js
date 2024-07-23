const https = require('https');

function getToken(clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = `client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}`;

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Write data to request body
    req.write(postData);
    req.end();
  });
}

// Example usage
const clientId = '547046004661-tgps9d2qb5nh777ibvf3us9nv07t40kn.apps.googleusercontent.com';
const clientSecret = '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';
const refreshToken = '1//0gKD5dMMTIY86CgYIARAAGBASNwF-L9IrgDhiBtKL27C6AXqXLDyAS0thhWEuVbMOUV4jtFFO_VWCZQeiawGkoMx0PfRy0ZDKjg0';

getToken(clientId, clientSecret, refreshToken)
  .then(tokenData => {
    //console.log('Token data:', tokenData);
  })
  .catch(error => {
    console.error('Error fetching token:', error);
  });
