const db = require('../lib/util.mongodb');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

module.exports = {
  userExists,
  userCredentialsValid,
  createUser,
};

async function userExists(username) {
  const user = await getUser({ username });
  return user == null ? false : true;
}

async function createUser({ username, password }) {
  if (await userExists(username)) {
    throw new Error('user exists');
  }

  const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
  await putUser({ username, pwdHash });
  return true;
}

async function userCredentialsValid({ username, password }) {
  const user = await getUser({ username });

  if (user != null && user.pwdHash != null) {
    const isValid = await bcrypt.compare(password, user.pwdHash);
    return isValid;
  }

  return false;
}

/**
 *
 * @param {{ username: string }}
 * @returns {{ username: string, pwdHash: string } | void }
 */
async function getUser({ username }) {
  const userCollection = await db.getUsersCollection();
  const user = await userCollection.findOne({ username });

  if (user == null) {
    return null;
  }

  return {
    username: user.username,
    pwdHash: user.pwdHash,
  }
}


/**
 *
 * @param {{ username: string, pwdHash: string }}
 */
async function putUser({ username, pwdHash }) {
  const userCollection = await db.getUsersCollection();
  await userCollection.insertOne({ username, pwdHash });

  return true;
}
