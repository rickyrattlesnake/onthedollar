const uuidv4 = require('uuid/v4');
const { getProfilesCollection } = require('../lib/util.mongodb');

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

  const profilesCollection = await getProfilesCollection();
  await profilesCollection.insertOne({
    profileId,
    userId,
    profileName,
    rawProfileData,
    processedProfileData
  });

  return profileId;
}

async function deleteProfile(userId, profileId) {
  const profilesCollection = await getProfilesCollection();
  await profilesCollection.deleteOne({
    profileId,
  });
  return true;
}

async function getProfilesByUser(userId) {
  const profilesCollection = await getProfilesCollection();
  return await profilesCollection.find({ userId })
    .toArray();
}

async function getProfileById(userId, profileId) {
  const profilesCollection = await getProfilesCollection();
  const profile = await profilesCollection.findOne({
    profileId
  });

  return profile == null ? null : profile;
}
