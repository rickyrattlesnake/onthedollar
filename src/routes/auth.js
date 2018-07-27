const router = require('express').Router();
const errorResponse = require('../lib/util.error-response');
const { userCredentialsValid, getUser } = require('../users/accessor');
const { generateSessionToken } = require('../auth/validate');

router.post('/session', async (req, res) => {
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

module.exports = router;
