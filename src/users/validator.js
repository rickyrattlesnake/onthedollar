module.exports = {
  validate,
};


function validate({
      username,
      password,
    }) {
  if (!isValidUsername(username)) {
    return {
      valid: false,
      message: 'invalid username'
    };
  }

  if (!isValidPassword(password)) {
    return {
      valid: false,
      message: 'invalid password'
    };
  }

  return {
    valid: true,
  };
}

function isValidUsername(username) {
  return typeof username === 'string' && username !== '';
}

function isValidPassword(password) {
  return typeof password === 'string' && password !== '';
}
