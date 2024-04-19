const router = require('express').Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const {
  upload, getUserProjection, isObjectId, getObjectIdSetUpdate, getUserAccess,
  isReservedForImages, getInput, getAuth, ACCESS, isJSONable, doPropagateLikes,
} = require('./util');
const { User, Quiz, Play } = require('./db');

/*----------------------------------------------------------------------------*/

const CreateUserSchema = Joi.object({
  username: Joi.string().alphanum().max(20).min(3)
    .required(),
  password: Joi.string().min(8).alphanum().required(),
  login: Joi.boolean().default(false),
});

router.post(
  '/user',
  upload.none(),
  getInput('body', CreateUserSchema),
  async (req, res) => {
    // Validate schema, and return error if invalid schema.
    const { username, password, login } = res.locals.body;

    // Check if the username is taken.
    const isTaken = await User.findOne({ username });
    if (isTaken != null) {
      return res.status(409).json({ error: 'username is taken' });
    }

    // Encrypt password.
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    // Create blank user.
    const user = new User({
      username,
      description: "Hello! I'm new here.",
      password: encryptedPassword,
      created: new Date(),
      isFollowing: [],
      isLiking: [],
      totalFollowers: 0,
      totalLikes: 0,
      admin: false,
      trophies: [],
    });

    // Save and return.
    await user.save();

    // If the user wishes to log in, they can.
    if (login) {
      req.session.uid = user.id;
      req.session.admin = user.admin;
    }

    return res.status(201).json({ id: user.id });
  },
);

/*----------------------------------------------------------------------------*/

const ListUsersSchema = Joi.object({
  query: Joi.string().allow('').optional().default(''),
  sort: Joi.string().valid('totalFollowers', 'created', 'totalLikes')
    .default('totalLikes'),
  data: Joi.string().valid('all', 'id').default('id'),
  count: Joi.number().min(0).max(100).default(50),
  page: Joi.number().min(0).default(0),
});

router.get(
  '/user',
  upload.none(),
  getInput('query', ListUsersSchema),
  async (req, res) => {
    const {
      query, sort, data, count, page,
    } = res.locals.query;

    // console.log(res.locals.query);

    // Perform aggregate search.
    const pipeline = User.aggregate();

    // Search if there is a query string.
    if (query.length !== 0) {
      pipeline
        .match({ $text: { $search: query } });
    }

    const results = await pipeline
      .project(getUserProjection(data))
      .sort({ [sort]: 'desc', id: 'asc' })
      .skip(page * count)
      .limit(count);

    // Return, based all the 'data' parameter.
    if (data === 'id') {
      res.json(results.map((v) => v.id));
    } else {
      res.json(results);
    }
  },
);

/*----------------------------------------------------------------------------*/

router.get('/user/:id', upload.none(), getAuth(), async (req, res) => {
  const { id } = req.params;
  const { you } = res.locals;

  // Check if user exists.
  const user = await User.findById(id, getUserProjection('all')).lean();
  if (user == null) {
    return res.status(404).json({ error: `account ${id} does not exist` });
  }

  // Determine if you follow this user, and return.
  user.followed = you?.isFollowing.some((i) => i.equals(id));

  // Return results.
  return res.status(200).json(user);
});

/*----------------------------------------------------------------------------*/

const EditUserSchema = Joi.object({
  profile: Joi.any().custom(isReservedForImages),
  description: Joi.string(),
});

router.put(
  '/user/:id',
  getAuth(true),
  upload.single('profile'),
  getInput('body', EditUserSchema),
  async (req, res) => {
    const { id } = req.params;
    const { you, body: { description } } = res.locals;
    const user = await User.findById(id);

    // Check if user can edit.
    const access = getUserAccess(user, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `user ${id} does not exist` });
    } if (access < ACCESS.EDIT) {
      return res.status(403).json({ error: `you cannot edit user ${id}` });
    }

    // Move profile, if given.
    let profile;
    if (req.file != null) {
      profile = `/files/${req.file.filename}`;
      await fs.rename(req.file.path, `./public${profile}`);
    }

    // Update and return.
    await user.updateOne({ description, profile });

    return res.status(200).json({ id });
  },
);

/*----------------------------------------------------------------------------*/

router.delete('/user/:id', getAuth(true), async (req, res) => {
  const { id } = req.params;
  const { you } = res.locals;
  const user = await User.findById(id);

  // Check if user can edit.
  const access = getUserAccess(user, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `user ${id} does not exist` });
  } if (access < ACCESS.EDIT) {
    return res.status(403).json({ error: `you cannot edit user ${id}` });
  }

  // Remove all the users likes, follows, and data.
  if (user != null) {
    // Remove user's follows.
    await User.updateMany({ _id: { $in: user.isFollowing } }, {
      $inc: { totalFollowers: -1 },
    });

    // Remove follows by users.
    await User.updateMany({ }, {
      $pull: { isFollowing: user._id },
    });

    // Remove user's likes.
    await doPropagateLikes(user.isLiking, -1);

    // Remove ownership of quiz their quizzes.
    await Quiz.updateMany({ user: user._id }, { $unset: 'user' });

    await user.deleteOne();
  }

  // Log out if signed in the that user, and return.
  if (id === req.session.uid) req.session.uid = null;
  return res.status(200).json({ id: null });
});

/*----------------------------------------------------------------------------*/
const GetSingleTrophySchema = Joi.object({
  id: Joi.string().custom(isObjectId),
});
router.get('/user/:id/trophies', getInput('params', GetSingleTrophySchema), getAuth(true, false), async (req, res) => {
  const { id } = res.locals.params;
  const user = await User.findById(id);
  if(user == null){
    return res.status(404).json({error: `user ${id} does not exist`});
  }
  const trophies = user.trophies;
  return res.status(200).json({trophies: trophies});  
});

/*----------------------------------------------------------------------------*/
const UpdateTrophiesSchema = new Joi.object({
  add: Joi.array().items(Joi.string().custom(isObjectId)).default([]),
  remove: Joi.array().items(Joi.string().custom(isObjectId)).default([]),
});
router.put('/user/:id/trophies', getAuth(true, false), getInput('body', UpdateTrophiesSchema), async (req, res) => {
  const id = req.params.id;
  const you = res.locals.you;
  const { add, remove } = res.locals.body;
  const user = await User.findById(id);
  if(user == null){
    return res.status(404).json({error: `Account ${id} does not exist`});
  }
  //Check to see what the user can see
  const access = getUserAccess(user, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `user ${id} does not exist` });
  } if (access < ACCESS.EDIT) {
    return res.status(403).json({ error: `you cannot edit user ${id}` });
  }
  //See what quizzes the user can see
  const exist = await Play.find({
    _id: { $in: add },
    ...(you.admin ? {} : {
      $or: [
        { public: true },
        { user: you._id },
        { whitelist: { $all: [you._id] } },
      ],
    }),
  }).distinct('_id');
  //See if any found quizzes are bad
  const bad = add.find((i) => !exist.some((j) => j.equals(i)));
  if (bad != null) {
    return res.status(404).json({
      error: `quiz ${bad.toHexString()} does not exist`,
    });
  }
  const [
    trophyIds, willAdd, willRemove,
  ] = getObjectIdSetUpdate(user.trophies, add, remove);

  //Check to see if anything was changed
  if(willAdd.length == 0 && willRemove.length == 0){
    return res.status(409).json({error: `Play ${trophyIds[0]} is not done`});
  }

  // Update the user's trophies.
  console.log(trophyIds);
  user.trophies = trophyIds;
  await user.save();

  return res.sendStatus(200);
});

/*----------------------------------------------------------------------------*/

const ListLikesSchema = Joi.object({
  count: Joi.number().min(0).max(100).default(50),
  page: Joi.number().min(0).default(0),
});

router.get(
  '/user/:id/likes',
  getAuth(true),
  getInput('query', ListLikesSchema),
  async (req, res) => {
    const { id } = req.params;
    const { you, query: { count, page } } = res.locals;
    const user = await User.findById(id);

    // Check if user can edit.
    const access = getUserAccess(user, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `user ${id} does not exist` });
    } if (access < ACCESS.EDIT) {
      return res.status(403).json({ error: `you cannot edit user ${id}` });
    }

    // Get paginated follows, and return.
    const follows = user.isLiking.slice(page * count, (page + 1) * count);
    return res.json(follows);
  },
);

/*----------------------------------------------------------------------------*/

const UpdateLikesSchema = Joi.object({
  add: Joi.any().custom(isJSONable(
    Joi.array().items(Joi.string().custom(isObjectId)),
  )).default([]),
  remove: Joi.any().custom(isJSONable(
    Joi.array().items(Joi.string().custom(isObjectId)),
  )).default([]),
});

router.put(
  '/user/:id/likes',
  getAuth(true),
  upload.none(),
  getInput('body', UpdateLikesSchema),
  async (req, res) => {
    const { id } = req.params;
    const { you, body: { add, remove } } = res.locals;
    const user = await User.findById(id);

    // Check if user can edit.
    const access = getUserAccess(user, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `user ${id} does not exist` });
    } if (access < ACCESS.EDIT) {
      return res.status(403).json({ error: `you cannot edit user ${id}` });
    }

    // Get visible quizzes.
    const exist = await Quiz.find({
      _id: { $in: add },
      ...(you.admin ? {} : {
        $or: [
          { public: true },
          { user: you._id },
          { whitelist: { $all: [you._id] } },
        ],
      }),
    }).distinct('_id');

    // Check if any are bad.
    const bad = add.find((i) => !exist.some((j) => j.equals(i)));
    if (bad != null) {
      return res.status(404).json({
        error: `quiz ${bad.toHexString()} does not exist`,
      });
    }

    // Figure out which quizzes the user is going to like or not.
    const [
      likeIds, willAdd, willRemove,
    ] = getObjectIdSetUpdate(user.isLiking, add, remove);

    // Propagate the stats to the quizzes and users.
    if (willAdd.length > 0) await doPropagateLikes(willAdd, 1);
    if (willRemove.length > 0) await doPropagateLikes(willRemove, -1);

    // Update the user's likes.
    user.isLiking = likeIds;
    await user.save();

    return res.status(200).json({ id });
  },
);

/*----------------------------------------------------------------------------*/

const ListFollowsSchema = Joi.object({
  count: Joi.number().min(0).max(100).default(50),
  page: Joi.number().min(0).default(0),
});

router.get(
  '/user/:id/follows',
  getAuth(true),
  getInput('query', ListFollowsSchema),
  async (req, res) => {
    const { id } = req.params;
    const { you, query: { count, page } } = res.locals;
    const user = await User.findById(id);

    // Check if user can edit.
    const access = getUserAccess(user, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `user ${id} does not exist` });
    } if (access < ACCESS.EDIT) {
      return res.status(403).json({ error: `you cannot edit user ${id}` });
    }

    // Get paginated follows, and return.
    const follows = user.isFollowing.slice(page * count, (page + 1) * count);
    return res.json(follows);
  },
);

/*----------------------------------------------------------------------------*/

const UpdateFollowsSchema = Joi.object({
  add: Joi.any().custom(isJSONable(
    Joi.array().items(Joi.string().custom(isObjectId)),
  )).default([]),
  remove: Joi.any().custom(isJSONable(
    Joi.array().items(Joi.string().custom(isObjectId)),
  )).default([]),
});

router.put(
  '/user/:id/follows',
  getAuth(true),
  upload.none(),
  getInput('body', UpdateFollowsSchema),
  async (req, res) => {
    const { id } = req.params;
    const { you, body: { add, remove } } = res.locals;
    const user = await User.findById(id);

    // Check if user can edit.
    const access = getUserAccess(user, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `user ${id} does not exist` });
    } if (access < ACCESS.EDIT) {
      return res.status(403).json({ error: `you cannot edit user ${id}` });
    }

    // Check if any follows you are adding do not exist.
    const [{ bad }] = await User.aggregate()
      .group({ _id: null, ids: { $push: '$_id' } })
      .project({ bad: { $setDifference: [add, '$ids'] } });

    if (bad.length > 0) {
      return res.status(404).json({ error: `user ${bad[0]} does not exist` });
    }

    // Figure out who the user is going to unfollow or not.
    const [
      followIds, willAdd, willRemove,
    ] = getObjectIdSetUpdate(user.isFollowing, add, remove);

    // console.log(user.isFollowing, add, remove);

    // Update `totalFollowers`s.
    await User.updateMany({ _id: { $in: willAdd } }, {
      $inc: { totalFollowers: 1 },
    });

    await User.updateMany({ _id: { $in: willRemove } }, {
      $inc: { totalFollowers: -1 },
    });

    // Update `isFollowing`.
    user.isFollowing = followIds;
    await user.save();

    return res.status(200).json({ id });
  },
);

/*----------------------------------------------------------------------------*/

router.get('/user/:id/trophies', getAuth(false), async (req, res) => {
  const { id } = req.params;
  const { you } = res.locals;

  // Check if user exists.
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: `user ${id} does not exist` });
  }

  // Fetch the trophies that are visible to the user.
  const trophies = user.trophies
    .filter((trophy) => trophy.visibleTo.includes(you._id) || you.admin);

  // Return the trophies.
  return res.status(200).json({ trophies });
});

/*----------------------------------------------------------------------------*/

router.all('/me*', getAuth(true, false), (req, res) => {
  if (!req.session || !req.session.uid) {
    return res.status(403).json({ error: 'You are not signed in' });
  }

  try {
    const userId = req.session.uid;
    const additionalPath = req.originalUrl.split('/me')[1] || '';
    const newPath = `/api/user/${userId}${additionalPath}`;

    // x(`Redirecting to: ${newPath}`);
    return res.redirect(307, newPath);
  } catch (error) {
    console.error('Failed to redirect:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/*----------------------------------------------------------------------------*/

module.exports = router;
