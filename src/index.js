const express = require('express');
const morgan = require('morgan');
const errorResponse = require('./lib/util.error-response');
const stdHeaders = require('./lib/util.std-headers');
const { createUser, userCredentialsValid, getUser } = require('./users/accessor');
const { validate: validateUserInfo } = require('./users/validator');
// const profileStore = require('./income-profile/accessor');
// const profileValidator = require('./income-profile/validator');
// const { processIncome } = require('./tax-calculator/calculator');
const { generateSessionToken } = require('./auth/validate');

const profilesRouter = require('./routes/profiles');

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

app.use('/profiles', profilesRouter);

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

app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
