const allowedComplexHeaders = [
  'Content-Type',
  'Accept',
];

const allowesComplexMethods = [
  'GET',
  'HEAD',
  'PUT',
  'PATCH',
  'POST',
  'DELETE',
];

module.exports = {
  cors,
};

function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", allowedComplexHeaders.join(', '));
  res.header('Access-Control-Allow-Methods', allowesComplexMethods.join(', '))
  next();
}
