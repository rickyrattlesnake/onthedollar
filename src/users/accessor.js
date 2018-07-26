const db = require('../lib/util.mongodb');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

const SALT_ROUNDS = 10;

module.exports = {
  userExists,
  userCredentialsValid,
  createUser,
  getUser,
};

async function userExists(username) {
  const user = await getUser({ username });
  return user == null ? false : true;
}

async function createUser({ username, password }) {
  if (await userExists(username)) {
    throw new Error('user exists');
  }

  const userId = uuidv4();

  const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
  await putUser({ userId, username, pwdHash });
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
 * @returns { Promise<{ userId: string, username: string, pwdHash: string } | null> }
 */
async function getUser({ username }) {
  const userCollection = await db.getUsersCollection();
  const user = await userCollection.findOne({ username });

  if (user == null) {
    return null;
  }

  return {
    userId: user.userId,
    username: user.username,
    pwdHash: user.pwdHash,
  }
}


/**
 *
 * @param {{ username: string, pwdHash: string }}
 */
async function putUser({ userId, username, pwdHash }) {
  const userCollection = await db.getUsersCollection();
  await userCollection.insertOne({ userId, username, pwdHash });

  return true;
}
