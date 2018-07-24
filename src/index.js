const express = require('express');
const morgan = require('morgan');
const errorResponse = require('./lib/util.error-response');
const stdHeaders = require('./lib/util.std-headers');

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


app.post('/income', (req, res) => {

  res.status(200);
});


app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
