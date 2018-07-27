const router = require('express').Router();
const errorResponse = require('../lib/util.error-response');
const { createUser } = require('../users/accessor');
const { validate: validateUserInfo } = require('../users/validator');

router.post('/', async (req, res) => {
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

module.exports = router;
