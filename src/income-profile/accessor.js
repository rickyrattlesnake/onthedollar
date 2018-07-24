const uuidv4 = require('uuid/v4');

const profileStore = new Map();

module.exports = {
  createProfile,
  deleteProfile,
  getProfileById,
  getProfilesByUser,
};

function createProfile(userId, {
      profileName,
      superannuationPercentage,
      incomeAmount,
      incomeIncludesSuper,
      taxRatesYear,
    }) {

  const profileId = uuidv4();

  const currentProfiles = getProfilesByUser(userId);
  currentProfiles.push({
    profileId,
    profileName,
    superannuationPercentage,
    incomeAmount,
    incomeIncludesSuper,
    taxRatesYear
  });

  profileStore.set(String(userId), currentProfiles);

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

function getProfileById(userId, profileId) {
  const profiles = getProfilesByUser(userId);
  const profile = profiles.filter(profile => profile.profileId === profileId)[0];

  return profile == null ? null : profile;
}
