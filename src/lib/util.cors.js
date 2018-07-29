const allowedComplexHeaders = [
  'Content-Type',
  'Accept',
  'Authorization',
];

const allowedComplexMethods = [
  'GET',
  'HEAD',
  'PUT',
  'PATCH',
  'POST',
  'DELETE',
];

module.exports = {
  createCorsHandler,
};

function createCorsHandler({ allowedOrigin }) {
  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Headers', allowedComplexHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', allowedComplexMethods.join(', '));
    res.header('Access-Control-Max-Age', 600);
    next();
  }
}
