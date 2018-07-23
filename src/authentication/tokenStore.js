const tokens = new Set();

module.exports = {
  containsToken,
  putToken,
  deleteToken,
};


function containsToken(token) {
  return tokens.has(token);
}

function putToken(token) {
  return tokens.add(token);
}

function deleteToken(token) {
  return tokens.delete(token);
}
