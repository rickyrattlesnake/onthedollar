const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const privateKeyCert = fs.readFileSync(path.join(__dirname, 'keys', 'privatekey.pem'));
const publicKeyCert = fs.readFileSync(path.join(__dirname, 'keys', 'publickey.crt'));
const passphrase = process.env.PK_PASSPHRASE;

const EXPIRATION_SECONDS = 60 * 60;

module.exports = {
  generateSessionToken,
  verifyToken,
  extractAuthInformation,
}

async function generateSessionToken({ userId }) {
  return new Promise((resolve, reject) => {
    return jwt.sign({
        userId: String(userId)
      },
      {
        key: privateKeyCert,
        passphrase
      },
      {
        algorithm: 'RS256',
        expiresIn: EXPIRATION_SECONDS
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      }
    );
  });
}

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    return jwt.verify(token, publicKeyCert, (err, payload) => {
      if (err) {
        return reject(err);
      }
      return resolve(payload);
    })
  });
}

/**
 *
 * @param { string } authorizationHeader e.g. 'Bearer abc'
 * @returns { { userId: string } | null } null implies authentication error
 */
async function extractAuthInformation(authorizationHeader) {
  const credsRx = /^Bearer (.+)$/;

  if (credsRx.test(authorizationHeader)) {
    const token = credsRx.exec(authorizationHeader)[1];
    try {
      const payload = await verifyToken(token);
      return {
        userId: payload.userId,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('[-] validate.js :: expired token');
      }
      return null;

    }
  }

  return null;
}
