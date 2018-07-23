const uuidv4 = require('uuid/v4');
const tokenStore = require('./tokenStore');

module.exports = {
  isValidUser,
  generateSessionToken,
  isValidToken
};

function isValidUser(username, password) {
  return true;
}

function generateSessionToken() {
  const token = uuidv4();
  tokenStore.putToken(token);
  return token;
}

function isValidToken(token) {
  return tokenStore.containsToken(token);
}
