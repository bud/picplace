const router = require('express').Router();

const Joi = require('joi');
const fs = require('fs').promises;
const { Quiz, User, Comment } = require('./db');
const {
  getQuizProjection, getAuth, isObjectId, getInput, isReservedForImages,
  isJSONable, upload, getQuizAccess, ACCESS, getCommentProjection
  ,
} = require('./util');

/*----------------------------------------------------------------------------*/

router.post('/quiz', getAuth(true, false), async (_, res) => {
  /** @type {{ user: InstanceType<User> }} */
  const { you } = res.locals;

  // Create blank quiz.
  const quiz = new Quiz({
    user: you.id,
    version: 1,
    questions: [],
    totalComments: 0,
    totalLikes: 0,
    created: new Date(),
    public: false,
    whitelist: [],
  });

  // Save and return it's id.
  await quiz.save();
  return res.status(201).json({ id: quiz.id });
});

/*----------------------------------------------------------------------------*/

const ListQuizzesSchema = Joi.object({
  query: Joi.string().allow('').optional().default(''),
  user: Joi.string().allow('').custom(isObjectId),
  sort: Joi.string().valid('totalComments', 'created', 'totalLikes')
    .default('totalLikes'),
  data: Joi.string().valid('all', 'id').default('id'),
  count: Joi.number().min(0).max(100).default(50),
  page: Joi.number().min(0).default(0),
});

router.get(
  '/quiz',
  getAuth(),
  getInput('query', ListQuizzesSchema),
  async (req, res) => {
    const {
      query, sort, data, count, page, user,
    } = res.locals.query;

    /** @type {InstanceType<User>} */
    const { _id: uid, admin } = res.locals.you ?? {};

    // Perform search, and show only those visible.
    const pipeline = Quiz.aggregate();

    // Search if there is a query string.
    if (query.length !== 0) {
      pipeline
        .match({ $text: { $search: query } });
    }

    // If a specific user is specified, let that be.
    if (user !== '' && user != null) {
      pipeline.match({ user });
    }

    // If you are not an admin, you must obey privacy rules.
    if (!admin) {
      pipeline.match({
        $or: [
          { public: true },
          { user: uid },
          { whitelist: { $all: [uid] } },
        ],
      });
    }

    // Sort and paginate.
    pipeline
      .project(getQuizProjection(data))
      .sort({ [sort]: 'desc', id: 'asc' })
      .skip(page * count)
      .limit(count);

    // Get results.
    const results = await pipeline.exec();

    // console.log(results);

    // Return only id's if that is what the user specified.
    if (data === 'id') {
      results.forEach((v, i) => { results[i] = v.id; });
    }

    // Return results.
    return res.status(200).json(results);
  },
);

/*----------------------------------------------------------------------------*/

const GetQuizSchema = Joi.object({
  qid: Joi.string().custom(isObjectId).required(),
});

router.get(
  '/quiz/:qid',
  getAuth(false, false),
  getInput('params', GetQuizSchema),
  async (req, res) => {
    /** @type {InstanceType<User>} */
    const { you } = res.locals;
    const { qid } = res.locals.params;

    // Get the quiz.
    const quiz = await Quiz.findById(qid, getQuizProjection('all')).lean();

    console.log(quiz, you, getQuizAccess(quiz, you));

    // Ensure you can view it.
    if (getQuizAccess(quiz, you) < ACCESS.VIEW) {
      return res.status(404).json({ error: `quiz ${qid} does not exist` });
    }

    // Determine if you like it, and return.
    quiz.liked = you?.isLiking.some((i) => i.equals(qid));
    quiz.access = getQuizAccess(quiz, you);
    return res.json(quiz);
  },
);

/*----------------------------------------------------------------------------*/

const EditQuizSchema = Joi.object({
  name: Joi.string().allow(''),
  description: Joi.string().allow(''),
  thumbnail: Joi.any().custom(isReservedForImages),
  public: Joi.boolean(),
  timelimit: Joi.number(),
  whitelist: Joi.any().custom(isJSONable(
    Joi.array().items(Joi.string().custom(isObjectId)),
  )),
});

router.put(
  '/quiz/:qid',
  getAuth(true, false),
  upload.single('thumbnail'),
  getInput('body', EditQuizSchema),
  async (req, res) => {
    /** @type {{ user: InstanceType<User> }} */
    const { you, body } = res.locals;
    const { qid } = req.params;
    console.log(body);
    const quiz = await Quiz.findById(qid);

    // Ensure the user can edit this quiz.
    const access = getQuizAccess(quiz, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `quiz ${qid} does not exist` });
    } if (access === ACCESS.VIEW) {
      return res.status(403).json({ error: `you cannot edit quiz ${qid}` });
    }

    // Move filename, if given.
    let thumbnail;
    if (req.file != null) {
      thumbnail = `/files/${req.file.filename}`;
      await fs.rename(req.file.path, `./public${thumbnail}`);
    }

    // Update the quiz, and return;
    await quiz.updateOne({ ...body, thumbnail });

    return res.json({ id: quiz.id });
  },
);

/*----------------------------------------------------------------------------*/

router.delete('/quiz/:id', getAuth(false, false), async (req, res) => {
  /** @type {{ user: InstanceType<User> }} */
  const { you } = res.locals;
  const { id } = req.params;
  const quiz = await Quiz.findById(id);

  // Ensure the user can edit it.
  const access = getQuizAccess(quiz, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `quiz ${id} does not exist` });
  } if (access === ACCESS.VIEW) {
    return res.status(403).json({ error: `you cannot edit quiz ${id}` });
  }

  // Remove all the quiz's data, and all references.
  if (quiz != null) {
    // Remove likes by users.
    await User.updateMany({}, {
      $pull: { isLiking: quiz._id },
    });

    // Update your likes.
    you.totalLikes -= quiz.totalLikes;
    await you.save();

    await quiz.deleteOne();
  }

  return res.status(200).json({ id: null });
});

/*----------------------------------------------------------------------------*/
const GetCommentSchema = Joi.object({
  id: Joi.string().custom(isObjectId),
  cid: Joi.string().custom(isObjectId),
});
router.get(
  '/quiz/:id/comment/:cid',
  getAuth(false, false),
  getInput('params', GetCommentSchema),
  async (req, res) => {
    const { id, cid } = res.locals.params;
    const quiz = await Quiz.findById(id, getQuizProjection('all')).lean();
    if (quiz == null) {
      return res.status(404).json({ error: `quiz ${id} does not exist` });
    }
    const you = res.locals.you || undefined;
    if (getQuizAccess(quiz, you) < ACCESS.VIEW) {
      return res.status(404).json({ error: `quiz ${id} does not exist` });
    }
    const comment = await Comment
      .findById(cid, getCommentProjection('all')).lean();
    if (comment == null) {
      return res.status(404).send({
        error: `comment ${cid} does not exist`,
      });
    }
    // by the specs, we don't return the attached quiz
    // we also need to return a body attribute.
    comment.body = comment.description;
    delete comment.description;
    delete comment.quiz;
    return res.status(200).send(comment);
  },
);

/*----------------------------------------------------------------------------*/

router.get('/quiz/:id/questions', getAuth(true), async (req, res) => {
  const { id } = req.params;
  const { you } = res.locals;
  const quiz = await Quiz.findById(id);

  // Check if user can edit the quiz.
  const access = getQuizAccess(quiz, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `user ${id} does not exist` });
  } if (access < ACCESS.EDIT) {
    return res.status(403).json({ error: `you cannot edit user ${id}` });
  }

  // Return the quiz questions.
  return res.json(quiz.questions);
});

/*----------------------------------------------------------------------------*/

const QuestionSchema = Joi.object({
  name: Joi.string().allow(''),
  description: Joi.string().allow(''),
  image: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.allow(null)),
});

const BlankQuestion = QuestionSchema.append({
  type: Joi.string().valid('blank').required(),
});

const LocationQuestion = QuestionSchema.append({
  type: Joi.string().valid('location').required(),
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
});

const MatchQuestion = QuestionSchema.append({
  type: Joi.string().valid('match').required(),
  image: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
});

const ChoiceQuestion = QuestionSchema.append({
  type: Joi.string().valid('choice').required(),
  choices: Joi.array().items(Joi.string()).required(),
  answer: Joi.number().required(),
});

const UpdateQuestionsSchema = Joi.object({
  questions: Joi.any().custom(isJSONable(
    Joi
      .array()
      .items(BlankQuestion, LocationQuestion, MatchQuestion, ChoiceQuestion)
      .required(),
  )),
  images: Joi.any().custom(isReservedForImages),
});

router.put(
  '/quiz/:id/questions',
  getAuth(true),
  upload.array('images'),
  getInput('body', UpdateQuestionsSchema),
  async (req, res) => {
    /** @type {{ user: InstanceType<User> }} */
    const { you, body: { questions } } = res.locals;
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    // Ensure the user can edit this quiz.
    const access = getQuizAccess(quiz, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `quiz ${id} does not exist` });
    } if (access === ACCESS.VIEW) {
      return res.status(403).json({ error: `you cannot edit quiz ${id}` });
    }

    // Setup image files.
    const stored = new Map();

    for await (const question of questions) {
      if (typeof question.image !== 'number') continue;

      // Check if the file indicated by the number exists.
      const file = req.files.at(question.image);
      if (file == null) {
        return res.status(400).json({
          error: `image #${question.image} not found`,
        });
      }

      // Replace the number with the file's URL, and create that if not already.
      if (stored.has(question.image)) {
        question.image = stored.get(question.image);
      } else {
        const image = `/files/${file.filename}`;
        await fs.rename(file.path, `./public${image}`);
        stored.set(question.image, image);
        question.image = image;
      }
    }

    // Update questions and return.
    quiz.questions = questions;
    await quiz.save();

    return res.sendStatus(200);
  },
);

/*----------------------------------------------------------------------------*/

module.exports = router;
