const Joi = require('joi');
const bcrypt = require('bcrypt');
const router = require('express').Router();

const { upload } = require('./util');
const { User } = require('./db');

/*----------------------------------------------------------------------------*/

const LoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/session', upload.none(), async (req, res) => {
  // Validate input.
  const {
    value: { username, password },
    error,
  } = LoginSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Check if user already logged in.
  if (req.session.uid != null) {
    res.status(409).json({ error: 'already logged in' });
    return;
  }

  // Check if user exists.
  const user = await User.findOne({ username });
  if (user == null) {
    res.status(401).json({ error: 'incorrect username or password' });
    return;
  }

  // Check if passwords match.
  const compare = await bcrypt.compare(password, user.password);
  if (!compare) {
    res.status(401).json({ error: 'incorrect username or password' });
    return;
  }

  // Create session, return the user id.
  req.session.uid = user.id;
  req.session.admin = user.admin;
  res.status(201).json({ id: user.id });
});

/*----------------------------------------------------------------------------*/

router.get('/session', async (req, res) => {
  res.status(200).send({ id: req.session.uid ?? null });
});

/*----------------------------------------------------------------------------*/

router.delete('/session', async (req, res) => {
  // Remove the user id from the session, and return.
  req.session.uid = null;
  req.session.admin = false;
  res.status(200).send({ id: null });
});

/*----------------------------------------------------------------------------*/

module.exports = router;
