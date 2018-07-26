const router = require('express').Router();
const profileStore = require('../income-profile/accessor');
const profileValidator = require('../income-profile/validator');
const { processIncome } = require('../tax-calculator/calculator');
const { extractAuthInformation } = require('../auth/validate');
const errorResponse = require('../lib/util.error-response');


router.use(function (req, res, next) {
  const authInfo = extractAuthInformation(req.get('authorization'));

  if (authInfo == null) {
    const error = errorResponse.getUnauthorizedError();
    return res.status(error.statusCode)
      .send(error);
  }

  res.locals.userId = authInfo.userId;
  next();
})

router.post('/income', async (req, res) => {
  const userId = res.locals.userId;

  const {
    profileName,
    superPercentage,
    incomeAmount,
    incomeIncludesSuper,
    fiscalYear
  } = req.body;

  const validation = profileValidator.validate({
    profileName,
    superannuationPercentage: superPercentage,
    incomeAmount,
    incomeIncludesSuper,
    taxRatesYear: fiscalYear
  });

  if (validation.valid === false) {
    const error = errorResponse.getBadRequest(validation.message);

    return res.status(error.statusCode)
      .send(error);
  }

  const rawProfileData = {
    superPercentage,
    incomeAmount,
    incomeIncludesSuper,
    fiscalYear
  };

  try {
    const processedProfileData = await processIncome({
      income: incomeAmount,
      includesSuper: incomeIncludesSuper,
      superPercentage,
      fiscalYear,
    });

    const profileId = await profileStore.createProfile({
      userId,
      profileName,
      rawProfileData,
      processedProfileData,
    });

    return res.status(200)
      .send({
        profileId
      });
  } catch (error) {
    const apiError = errorResponse.getInternalServerError();
    return res.status(apiError.statusCode).send(apiError);
  }
});

router.get('/income/:id', async (req, res) => {
  const userId = res.locals.userId;

  const profileId = req.params.id;

  const profile = await profileStore.getProfileById(userId, profileId);

  if (profile == null) {
    const error = errorResponse.getNotFound('profile not found');
    return res.status(error.statusCode)
      .send(error);
  }

  return res.status(200)
    .send({
      profileName: profile.profileName,
      superAmount: profile.processedProfileData.superAmount,
      grossIncome: profile.processedProfileData.grossIncome,
      taxAmount: profile.processedProfileData.taxAmount,
      netIncome: profile.processedProfileData.netIncome,
      fiscalYear: profile.rawProfileData.fiscalYear,
    });
});

router.get('/income', async (req, res) => {
  const userId = res.locals.userId;

  const profiles = await profileStore.getProfilesByUser(userId);

  const trimmedProfiles = profiles.map(profile => ({
    profileName: profile.profileName,
    superAmount: profile.processedProfileData.superAmount,
    grossIncome: profile.processedProfileData.grossIncome,
    taxAmount: profile.processedProfileData.taxAmount,
    netIncome: profile.processedProfileData.netIncome,
    fiscalYear: profile.rawProfileData.fiscalYear,
  }));

  if (profiles.length === 0) {
    const error = errorResponse.getNotFound('profiles not found');
    return res.status(error.statusCode)
      .send(error);
  }

  return res.status(200)
    .send(trimmedProfiles);
});

router.delete('/income/:id', async (req, res) => {
  const userId = res.locals.userId;

  const profileId = req.params.id;

  try {
    await profileStore.deleteProfile(userId, profileId);
    return res.status(200).send({});
  } catch (error) {
    const apiError = errorResponse.getInternalServerError();
    return res.status(apiError.statusCode).send(apiError);
  }

});

module.exports = router;
