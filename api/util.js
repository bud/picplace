const multer = require('multer');
const path = require('path');
const {
  // eslint-disable-next-line no-unused-vars
  Request, Response, NextFunction, RequestHandler,
} = require('express');
// eslint-disable-next-line no-unused-vars
const { Schema, CustomHelpers, CustomValidator } = require('joi');
const uuid = require('uuid');
const { ObjectId } = require('mongoose').Types;
// eslint-disable-next-line no-unused-vars
const { User, Quiz } = require('./db');

/*----------------------------------------------------------------------------*/

/**
 * If you want an Object ID, but do not want it to error, use this.
 * @param {string} id The potential HEX string.
 * @returns The Object ID from the hex string.
 */
function getSafeObjectId(id) {
  return ObjectId.isValid(id)
    ? ObjectId.createFromHexString(id)
    : null;
}

/*----------------------------------------------------------------------------*/

/**
 * Middleware helper to determine if the user if logged in or not.
 * @param {boolean} isUser If true, fail if the user is not logged in.
 * @param {boolean} isAdmin If true, fail if the user is not an admin.
 * @param {Request} req The request.
 * @param {Response} res The response.
 * @param {NextFunction} next The next function.
 * @returns {void}
 */
async function isAuthenticated(isUser, isAdmin, req, res, next) {
  const user = await User.findById(req.session.uid);

  if (isUser && user == null) {
    req.session.uid = null;
    res.status(401).send({ error: 'you must log in' });
  } else if (isAdmin && !user.admin) {
    res.status(403).send({ error: 'you be an admin' });
  } else {
    res.locals.you = user;
    next();
  }
}

/**
 * Express middle to determine the user's authentication. If the user exists,
 * it is put is `res.locals.you`.
 * @param {boolean} user If true, invalidate if the user is not logged in.
 * @param {boolean} admin If true, invalidate if the user is not an admin.
 * @returns {RequestHandler} The middleware function.
 */
function getAuth(user = false, admin = false) {
  return (req, res, next) => isAuthenticated(user, admin, req, res, next);
}

/*----------------------------------------------------------------------------*/

/**
 * Middleware helper to determine if an input is valid. If the input validates,
 * it's ouput is put in `res.locals[from]`.
 * @param {'body' | 'query'} from Where the input is coming from. The actual
 * data is taken from `req[from]`.
 * @param {Schema} schema The schema the input must follow.
 * @param {Request} req The request.
 * @param {Response} res The response.
 * @param {NextFunction} next The next function.
 * @returns {void}
 */
async function isValidInput(from, schema, req, res, next) {
  const { value, error } = schema.validate(req[from]);

  if (error) return res.status(400).send({ error: error.message });
  res.locals[from] = value;
  return next();
}

/**
 * Express middleware to determine if an input is valid. If the input validates,
 * it's ouput is put in `res.locals[from]`.
 * @param {'body' | 'query' | 'params'} from Where the input is coming from. The
 * actual data is taken from `req[from]`.
 * @param {Schema} schema The schema the input must follow.
 * @returns {RequestHandler} The middleware function.
 */
function getInput(from, schema) {
  return (req, res, next) => isValidInput(from, schema, req, res, next);
}

/*----------------------------------------------------------------------------*/

/**
 * Given a set of IDs, and a set of those you want to remove, and ones you want
 * to keep, it returns those that will actually be removed, those actually
 * added, and the ending set of IDs.
 * @param {ObjectId[]} original The original set of IDs. There can be duplicate
 * IDs.
 * @param {ObjectId[]} add The set of IDs to add. There can be duplicate IDs.
 * @param {ObjectId[]} remove The set of IDs to remove. There can be duplicate
 * IDs.
 * @returns {[ObjectId[], ObjectId[], ObjectId[]]} The first list is resulting
 * IDs after all adding and removing; the second is the set of all IDs truly
 * added; and the third is those truly removed. There are no duplicates.
 */
function getObjectIdSetUpdate(original, add, remove) {
  const originalIds = new Set(original.map((i) => i.toHexString()));
  const addIds = add.map((i) => i.toHexString());
  const removeIds = remove.map((i) => i.toHexString());

  const willAdd = new Set();
  const willRemove = new Set();

  for (const addId of addIds) {
    if (originalIds.has(addId)) continue;
    originalIds.add(addId);
    willAdd.add(ObjectId.createFromHexString(addId));
  }

  for (const removeId of removeIds) {
    if (!originalIds.has(removeId)) continue;
    originalIds.delete(removeId);
    willRemove.add(ObjectId.createFromHexString(removeId));
  }

  return [
    [...originalIds],
    [...willAdd],
    [...willRemove],
  ];
}

/**
 * Given a user document, return all stats visible to a casual user.
 * @param {'all' | 'id'} data If `'id'`, return only the ID.
 * @returns The projection to use in a MongoDB query.
 */
function getUserProjection(data) {
  // Create projection.
  const project = { id: '$_id', _id: false };

  // If 'all' is specificed, return entire user's data.
  if (data === 'all') {
    Object.assign(project, {
      username: '$username',
      admin: '$admin',
      description: '$description',
      created: '$created',
      profile: '$profile',
      trophies: '$trophies',
      isFollowing: { $size: '$isFollowing' },
      isLiking: { $size: '$isLiking' },
      totalFollowers: '$totalFollowers',
      totalLikes: '$totalLikes',
    });
  }

  return project;
}

/**
 * Given a quiz document, return all stats visible to a casual user.
 * @param {'all' | 'id'} data If `'id'`, return only the ID.
 * @returns The projection to use in a MongoDB query.
 */
function getQuizProjection(data) {
  // Create projection.
  const project = { id: '$_id', _id: false };

  // If 'all' is specificed, return entire quiz's data.
  if (data === 'all') {
    Object.assign(project, {
      name: '$name',
      description: '$description',
      thumbnail: '$thumbnail',
      user: '$user',
      created: '$created',
      version: '$version',
      totalQuestions: { $size: '$questions' },
      totalComments: '$totalComments',
      totalPlays: '$totalPlays',
      totalLikes: '$totalLikes',
      public: '$public',
      whitelist: '$whitelist',
      timelimit: '$timelimit',
    });
  }

  return project;
}

function getPlayProjection(data) {
  // Create projection.
  const project = { id: '$_id', _id: false };

  // If 'all' is specificed, return entire play's data.
  if (data === 'all') {
    Object.assign(project, {
      version: '$version',
      quiz: '$quiz',
      user: '$user',
      guesses: '$guesses',
      public: '$public',
      start: '$start',
      end: '$end',
      totalScore: '$totalScore',
      scores: '$scores',
      isScored: '$isScored',
    });
  }

  return project;
}

function getCommentProjection(data) {
  // Create projection.
  const project = { id: '$_id', _id: false };

  // If 'all' is specificed, return entire comments's data.
  if (data === 'all') {
    Object.assign(project, {
      name: '$user',
      quiz: '$quiz',
      description: '$description',
      created: '$created',
    });
  }

  return project;
}

/**
 * Given a report document, return all of its stats
 * TODO: Figure out how to handle visibility, as only admins
 * should be able to see them.
 * @param {'all' | 'id'} data If `'id'`, return only the ID.
 * @returns The projection to use in a MongoDB query.
 */
function getReportProjection(data) {
  const project = { id: '$_id', _id: false };
  if (data === 'all') {
    Object.assign(project, {
      type: '$type',
      item: '$item',
      reason: '$reason',
      reporter: '$reporter',
      created: '$created',
    });
  }
  return project;
}
/**
 * When changing the likes that certain quizzes have, from a single viewer,
 * update the `totalLikes` of a quiz, and then the `totalLikes` of all owners of
 * the quizzes.
 * @param {ObjectId[]} items The quizzes to change likes from.
 * @param {-1 | 1} weight If `-1`, dislike the `items`. If `1`, like them.
 */
async function doPropagateLikes(items, weight) {
  // Update the likes of the quizzes.
  await Quiz.updateMany({ _id: { $in: items } }, {
    $inc: { totalLikes: weight },
  });

  // Update to the `totalLikes` of users.
  await Quiz.aggregate()
    // Find all quizzes we added likes to.
    .match({ _id: { $in: items } })
    // Get their owners, and put them in a field `_o`.
    .lookup({
      from: 'user',
      localField: 'user',
      foreignField: '_id',
      as: '_o',
    })
    // Combine matching owners, and store their count in `_c`.
    .group({
      _id: '$user',
      _c: { $sum: weight },
      _o: { $first: { $first: '$_o' } },
    })
    // Update the `totalLikes` of the owners, currently in `_o`.
    .addFields({ '_o.totalLikes': { $add: ['$_o.totalLikes', '$_c'] } })
    // Make the owners the main document now.
    .replaceRoot('$_o')
    // Push to the database.
    .append({ $merge: 'user' });
}

/*----------------------------------------------------------------------------*/

/**
 * Use this validator to ensure users do not use a parameter. For example, for
 * image inputs, users could put text in it instead.
 * @param {any} value The input value. DO NOT TOUCH.
 * @param {CustomHelpers} helper Joi helper item. DO NOT TOUCH.
 */
function isReservedForImages(value, helper) {
  if (value == null) return value;
  return helper.message(`${value} is reserved for images`);
}

/**
 * Put this validator into a Joi schema to check and coerce an input into a
 * MongoDB Object ID.
 * @param {any} value The input value. DO NOT TOUCH.
 * @param {CustomHelpers} helper Joi helper item. DO NOT TOUCH.
 */
function isObjectId(value, helper) {
  if ((value ?? '').length === 0) return false;
  if (ObjectId.isValid(value)) return ObjectId.createFromHexString(value);
  return helper.message(`invalid object ${value}`);
}

/**
 * Put this validator into a Joi schema to check and coerce an input into a
 * JSON input. This is useful for allowing the request to contain JSON and
 * FormData images.
 * @param {Schema} schema The schema for the inner JSON.
 * @returns {CustomValidator} The custom validator.
 */
function isJSONable(schema) {
  return (_value, helper) => {
    let value = _value;

    // Attempt to parse.
    try {
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }
    } catch (err) {
      return helper.message(`${value} is invalid json`);
    }

    // Run validation.
    console.log(value);
    const { value: result, error } = schema.validate(value);
    console.log(error);
    if (error) return helper.message(error.message);
    return result;
  };
}

/*----------------------------------------------------------------------------*/

/** The types of access users can have for an item. */
const ACCESS = {
  /** @type {-1} The item truly does not exist. */
  DNE: -1,
  /** @type {0} The item exists, but the user is not allowed to see it. */
  NONE: 0,
  /** @type {1} The user can view the item, but not edit it. */
  VIEW: 1,
  /** @type {2} The user has full edit access. */
  EDIT: 2,
};

/**
 * Determine the type of access a user has to a quiz.
 * @param {Quiz | null} quiz The quiz the user wishes to access.
 * @param {User | null} user The user that wants access.
 * @returns {-1 | 0 | 1 | 2} The level of access the user has.
 */
function getQuizAccess(quiz, user) {
  if (quiz == null) return ACCESS.DNE;

  // Ensure the user can view it.
  if (!quiz.user?.equals?.(user?.id) && !quiz.public && !user?.admin
    && !quiz.whitelist.some((i) => i.equals(user?.id))) return ACCESS.NONE;

  // Check if the user can edit it.
  if (!user?.admin && !user?._id.equals(quiz.user)) return ACCESS.VIEW;

  return ACCESS.EDIT;
}

function getPlayAccess(play, user) {
  if (play == null) return ACCESS.DNE;

  // Ensure the user can view it.
  if (!play.user?.equals?.(user?.id)
      && !play.public && !user?.admin) return ACCESS.NONE;

  // Check if the user can edit it.
  if (!user?.admin && !user?._id.equals(play.user)) return ACCESS.VIEW;

  return ACCESS.EDIT;
}

/**
 * Determine the type of access a user has to a user's data.
 * @param {Quiz | null} toUser The data the user wishes to access.
 * @param {User | null} fromUser The user that wants access.
 * @returns {-1 | 0 | 1 | 2} The level of access the user has.
 */
function getUserAccess(toUser, fromUser) {
  if (toUser == null) return ACCESS.DNE;

  // Check if the user can edit the user.
  if (!toUser.admin && !toUser._id.equals(fromUser._id)) return ACCESS.VIEW;

  return ACCESS.EDIT;
}

/**
 * Determines if a user can see or edit a comment
 * Note that we assume that a user can see the attached quiz
 * @param {Comment | null} comment The data the user wishes to access.
 * @param {User | null} user The user that wants access.
 * @returns {-1 | 0 | 1 | 2} The level of access the user has.
 */
function getCommentAccess(comment, user) {
  if (comment == null) return ACCESS.DNE;

  // Check if the user can edit the comment
  if (!user.admin && !comment.user.equals(user.id)) {
    return ACCESS.VIEW;
  }
  return ACCESS.EDIT;
}

/*----------------------------------------------------------------------------*/

// The storage solution for the server.
const storage = multer.diskStorage({
  // Send all images to `__temp__`.
  destination: (_, __, cb) => cb(null, '__temp__'),

  // Give all images a unique, unrelated filename so they do not conflict.
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid.v4()}${ext}`);
  },
});

// Use this to get images from FormData.
const upload = multer({
  storage,

  // Only allow images.
  fileFilter(_, file, callback) {
    const ext = path.extname(file.originalname);

    if (['.png', '.jpg', '.gif', '.jpeg'].includes(ext)) {
      return callback(null, true);
    }

    return callback(new multer.MulterError('only images allowed'));
  },

  // Make sure users don't crash the server.
  limits: { fileSize: 8e6 },
});

/*----------------------------------------------------------------------------*/

module.exports = {
  getUserProjection,
  upload,
  isObjectId,
  getObjectIdSetUpdate,
  getQuizProjection,
  getAuth,
  getSafeObjectId,
  getInput,
  isReservedForImages,
  isJSONable,
  getQuizAccess,
  ACCESS,
  getUserAccess,
  doPropagateLikes,
  getPlayProjection,
  getPlayAccess,
  getCommentProjection,
  getReportProjection,
  getCommentAccess,
};
