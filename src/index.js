const express = require('express');
const morgan = require('morgan');
const stdHeaders = require('./lib/util.std-headers');

const profilesRouter = require('./routes/profiles');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

console.log('[-] environment :: PORT=', PORT);
console.log('[-] environment :: ALLOWED_ORIGIN=', ALLOWED_ORIGIN);

const {
  createCorsHandler,
} = require('./lib/util.cors');

const app = express();

app.use(morgan('dev'));

// set response headers
app.use((req, res, next) => {
  res.set('Content-Type', stdHeaders.contentType);
  return next();
});

// cors
app.use(createCorsHandler({ allowedOrigin: ALLOWED_ORIGIN }));

// parser middleware
app.use(express.json());

app.use('/profiles', profilesRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
