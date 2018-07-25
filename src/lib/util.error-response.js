module.exports = {
  getBadRequest: msg => ({
    statusCode: 400,
    message: msg || 'bad request',
  }),

  getNotFound: msg => ({
    statusCode: 404,
    message: msg || 'not found',
  }),

  getInternalServerError: msg => ({
    statusCod: 500,
    message: msg || 'internal server error'
  })
};
