const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const privateKeyCert = fs.readFileSync(path.join(__dirname, 'keys', 'privatekey.pem'));
const publicKeyCert = fs.readFileSync(path.join(__dirname, 'keys', 'publickey.crt'));
const passphrase = process.env.PK_PASSPHRASE;

const EXPIRATION_SECONDS = 10 * 60;

module.exports = {
  generateSessionToken,
  verifyToken,
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
