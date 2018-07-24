const uuidv4 = require('uuid/v4');
const MongoClient = require('mongodb').MongoClient;

const dbName = 'taxTracker';
const profileCollectionName = 'profiles';

const connectionUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const connection = MongoClient.connect(connectionUrl);


const profileStore = new Map();

module.exports = {
  createProfile,
  deleteProfile,
  getProfileById,
  getProfilesByUser,
};

async function createProfile(userId, {
      profileName,
      superannuationPercentage,
      incomeAmount,
      incomeIncludesSuper,
      taxRatesYear,
    }) {

  const profileId = uuidv4();


  const activeConnection = await connection;
  const db = activeConnection.db(dbName);
  const collection = await db.createCollection(profileCollectionName);
  await collection.insertOne({
    profileId,
    profileName,
    superannuationPercentage,
    incomeAmount,
    incomeIncludesSuper,
    taxRatesYear
  });

  return profileId;
}

function deleteProfile(userId, profileId) {
  const profiles = getProfilesByUser(userId);
  const filteredProfiles = profiles.filter(profile => profile.profileId !== profileId);
  profileStore.set(String(userId), filteredProfiles);

  if (filteredProfiles.length == profiles.length) {
    return false;
  }
  return true;
}

function getProfilesByUser(userId) {
  return profileStore.get(String(userId)) || [];
}

async function getProfileById(userId, profileId) {
  const activeConnection = await connection;
  const db = activeConnection.db(dbName);
  const collection = await db.createCollection(profileCollectionName);
  const profile = await collection.findOne({
    profileId
  });

  return profile == null ? null : profile;
}
