const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan('dev'));

app.get('/test', (req, res) => {
  console.log(req.get('token'));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`[v] connected on port ${PORT}`);
});
