require('dotenv').config({ path: './.env' });

const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');

require('express-async-errors');

const app = express();

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const SECRET = process.env.SECRET ?? 'test';
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
}));

const run = process.env.RUN === 'prod' ? 'prod' : 'dev';
console.log(`Running as: ${run}`);

if (run === 'prod') {
  app.use(express.static('client/build'));
}

app.use(express.static('public'));

/*----------------------------------------------------------------------------*/

app.use('/api', require('./api'));

app.use((error, _, res, next) => {
  (() => next)();
  console.log(error);

  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: error.message.toLowerCase() });
  } else {
    res.status(500).json({ error: 'internal server error' });
  }
});

/*----------------------------------------------------------------------------*/

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Good on: ${PORT}`);
});
