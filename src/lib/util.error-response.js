module.exports = {
  getBadRequest: (msg) => ({
    statusCode: 400,
    message: msg || 'Bad Request',
  }),
};
