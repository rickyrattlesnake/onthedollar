const express = require('express');
const morgan = require('morgan');
const errorResponse = require('./lib/util.error-response');
const stdHeaders = require('./lib/util.std-headers');
const profileStore = require('./income-profile/accessor');
const profileValidator = require('./income-profile/validator');
const { processIncome } = require('./tax-calculator/calculator');

const PORT = process.env.PORT || 3000;

console.log('[-] environment :: PORT=', PORT);

const {
  generateSessionToken,
  isValidUser,
} = require('./authentication/authenticate');

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


app.get('/auth/token', (req, res) => {
  const authHeader = req.get('authorization');
  const credsRx = /^Basic (.+)$/;

  let username, password;
  if (credsRx.test(authHeader)) {
    const encodedCreds = credsRx.exec(authHeader)[1];
    [username, password] = Buffer.from(encodedCreds, 'base64').toString().split(':');
  }

  if (username == null || username === '' || password == null || password === '') {
    const error = errorResponse.getBadRequest('username and password must be provided');

    return res.status(error.statusCode)
      .send(error);
  }

  if (!isValidUser(username, password)) {
    const error = errorResponse.getBadRequest('invalid username or password');

    return res.status(error.statusCode)
      .send(error);
  }

  const token = generateSessionToken();

  return res.status(200)
    .send({
      token,
    });
});


app.post('/profiles/income', async (req, res) => {
  const userId = '123';

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

app.get('/profiles/income/:id/detail', async (req, res) => {
  return res.status(501).send({});
});

app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
