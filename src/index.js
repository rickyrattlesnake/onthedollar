const express = require('express');
const morgan = require('morgan');
const errorResponse = require('./lib/util.error-response');
const stdHeaders = require('./lib/util.std-headers');
const profileStore = require('./income-profile/accessor');
const profileValidator = require('./income-profile/validator');
const { processIncome } = require('./tax-calculator/calculator');
const { createUser, userCredentialsValid, getUser } = require('./users/accessor');
const { validate: validateUserInfo } = require('./users/validator');
const { extractAuthInformation, generateSessionToken } = require('./auth/validate');

const PORT = process.env.PORT || 3000;

console.log('[-] environment :: PORT=', PORT);

const {
  cors,
} = require('./lib/util.cors');

const app = express();

app.use(morgan('dev'));

// set response headers
app.use((req, res, next) => {
  res.set('Content-Type', stdHeaders.contentType);
  return next();
});

// cors
app.use(cors);

// parser middleware
app.use(express.json());


app.post('/auth/session', async (req, res) => {
  const { username, password } = req.body;

  if (username == null || username === '' || password == null || password === '') {
    const error = errorResponse.getBadRequest('username and password must be provided');
    return res.status(error.statusCode)
      .send(error);
  }

  if (! await userCredentialsValid({ username, password})) {
    const error = errorResponse.getUnauthorizedError();
    return res.status(error.statusCode)
      .send(error);
  }

  const { userId } = await getUser({ username });
  const token = await generateSessionToken({ userId });
  return res.status(200)
    .send({
      token,
    });
});

app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  const validation = validateUserInfo({ username, password });
  if (!validation.valid) {
    const error = errorResponse.getBadRequest(validation.message);
    return res.status(error.statusCode)
      .send(error);
  }

  try {
    await createUser({ username, password});
  } catch (error) {
    if (error.message == 'user exists') {
      const parsedError = errorResponse.getBadRequest(error.message);
      return res.status(parsedError.statusCode)
        .send(parsedError);
    }
    throw error;
  }

  return res.status(200)
    .send({});
});


app.post('/profiles/income', async (req, res) => {
  const authInfo = extractAuthInformation(req.get('authorization'));

  if (authInfo == null) {
    const error = errorResponse.getUnauthorizedError();
    return res.status(error.statusCode)
      .send(error);
  }

  const userId = authInfo.userId;

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

app.get('/profiles/income/:id', async (req, res) => {
  const userId = '123';

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

app.get('/profiles/income', async (req, res) => {
  const userId = '123';

  const profiles = await profileStore.getProfilesByUser(userId);

  const trimmedProfiles = profiles.map(p => ({
    profileName: p.profileName,
    superannuationPercentage: p.superannuationPercentage,
    incomeAmount: p.incomeAmount,
    incomeIncludesSuper: p.incomeIncludesSuper,
    taxRatesYear: p.taxRatesYear
  }));

  if (profiles.length === 0) {
    const error = errorResponse.getNotFound('profiles not found');
    return res.status(error.statusCode)
      .send(error);
  }

  return res.status(200)
    .send(trimmedProfiles);
});

app.delete('/profiles/income/:id', async (req, res) => {
  const userId = '123';

  const profileId = req.params.id;

  try {
    await profileStore.deleteProfile(userId, profileId);
    return res.status(200).send({});
  } catch (error) {
    const apiError = errorResponse.getInternalServerError();
    return res.status(apiError.statusCode).send(apiError);
  }

});

app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
