const MongoClient = require('mongodb').MongoClient;
const MongoLogger = require('mongodb').Logger;
MongoLogger.setLevel('info');

const defaultDbName = 'taxTracker';
const connectionUrl = process.env.MONGODB_URI || `mongodb://localhost:27017/${defaultDbName}`;
const profileCollectionName = 'profiles';
const userCollectionName = 'users';

console.log(`[-] util.mongodb :: connectionUrl=${connectionUrl}`);

let profilesCollection;
let usersCollection;
const initialized = (async function() {

  let client;
  try {
    client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
    const db = await client.db();

    try {
      profilesCollection = await db.createCollection(profileCollectionName);
      await profilesCollection.createIndex({ profileId: 1}, { unique: true });
    } catch (error) {
      if (error.name === 'MongoError' &&
          error.codeName === 'NamespaceExists') {
        console.warn(`[~] accessor.js :: collection ${profileCollectionName} already exists`);
      } else {
        throw error;
      }
    }

    try {
      usersCollection = await db.createCollection(userCollectionName);
      await usersCollection.createIndex({ username: 1}, { unique: true });
    } catch (error) {
      if (error.name === 'MongoError' &&
      error.codeName === 'NamespaceExists') {
        console.warn(`[~] accessor.js :: collection ${userCollectionName} already exists`);
      } else {
        throw error;
      }
    }
  } catch (err) {
    console.error(err);
  }
})();

module.exports = {
  getProfilesCollection: async () => {
    await initialized;
    return profilesCollection;

  },
  getUsersCollection: async () => {
    await initialized;
    return usersCollection;
  },
}
