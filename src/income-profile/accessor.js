const uuidv4 = require('uuid/v4');
const MongoClient = require('mongodb').MongoClient;
const MongoLogger = require('mongodb').Logger;
MongoLogger.setLevel('info');

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'taxTracker';
const profileCollectionName = 'profiles';

let profileCollection;
const initialized = (async function() {

  const connectionUrl = `${mongodbUri}/${dbName}`;
  console.log('[-] accessor.js :: connectionUrl =', connectionUrl);

  let client;
  try {
    client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
    profileCollection = await client.db(dbName).createCollection(profileCollectionName);
    console.log('[v] accessor.js :: connection success');
  } catch (err) {
    console.error(err);
  }
})();


module.exports = {
  createProfile,
  deleteProfile,
  getProfileById,
  getProfilesByUser,
};

async function createProfile({
      userId,
      profileName,
      rawProfileData,
      processedProfileData,
    }) {

  const profileId = uuidv4();

  await initialized;
  await profileCollection.insertOne({
    profileId,
    userId,
    profileName,
    rawProfileData,
    processedProfileData
  });

  return profileId;
}

async function deleteProfile(userId, profileId) {
  await profileCollection.deleteOne({
    profileId,
  });
  return true;
}

async function getProfilesByUser(userId) {
  return await profileCollection.find({ userId })
    .toArray();
}

async function getProfileById(userId, profileId) {
  const profile = await profileCollection.findOne({
    profileId
  });

  return profile == null ? null : profile;
}
