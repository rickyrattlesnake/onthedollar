const MongoClient = require('mongodb').MongoClient;
const MongoLogger = require('mongodb').Logger;
MongoLogger.setLevel('info');

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'taxTracker';
const profileCollectionName = 'profiles';
const userCollectionName = 'users';

let profilesCollection;
let usersCollection;
const initialized = (async function() {
  const connectionUrl = `${mongodbUri}/${dbName}`;
  console.log('[-] accessor.js :: connectionUrl =', connectionUrl);

  let client;
  try {
    client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });


    try {
      profilesCollection = await client.db(dbName).createCollection(profileCollectionName);
      await profilesCollection.createIndex({ profileId: 1}, { unique: true });
    } catch (error) {
      if (error.name === 'MongoError' &&
          error.codeName === 'NamespaceExists') {
        console.log(`[~] accessor.js :: collection ${profileCollectionName} already exists`);
      } else {
        throw error;
      }
    }

    try {
      usersCollection = await client.db(dbName).createCollection(userCollectionName);
      await usersCollection.createIndex({ username: 1}, { unique: true });
    } catch (error) {
      if (error.name === 'MongoError' &&
      error.codeName === 'NamespaceExists') {
        console.log(`[~] accessor.js :: collection ${userCollectionName} already exists`);
      } else {
        throw error;
      }
    }


    console.log('[v] accessor.js :: connection success');
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
