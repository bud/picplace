const router = require('express').Router();

const Joi = require('joi');
const { Quiz, Comment } = require('./db');
const {
  getAuth, isObjectId, getInput,
  getQuizAccess, ACCESS, getCommentProjection,
  getCommentAccess,
} = require('./util');

/*----------------------------------------------------------------------------*/

const GetCommentSchema = Joi.object({
  id: Joi.string().custom(isObjectId),
});

router.get(
  '/comment/:id',
  getAuth(false, false),
  getInput('params', GetCommentSchema),
  async (_, res) => {
    const { id } = res.locals.params;

    const comment = await Comment
      .findById(id, getCommentProjection('all')).lean();

    if (comment == null) {
      return res.status(404).send({
        error: `comment ${id} does not exist`,
      });
    }

    return res.status(200).send(comment);
  },
);

/*----------------------------------------------------------------------------*/

router.delete(
  '/comment/:cid',
  getAuth(true, false),
  getInput('params', GetCommentSchema),
  async (_, res) => {
    const { id } = res.locals.params;
    const { you } = res.locals;

    const comment = await Comment.findById(id);
    if (comment == null) {
      return res.status(404).json({ error: `comment ${id} does not exist` });
    }

    const commentAccess = getCommentAccess(comment, you);
    if (commentAccess < ACCESS.EDIT) {
      return res.status(403).json({ error: 'you are unauthorized' });
    }

    await comment.deleteOne();

    const quiz = Quiz.findById(comment.quiz);

    if (quiz != null) {
      await quiz.updateOne({ totalComments: (quiz.totalComments - 1) });
    }

    return res.status(200);
  },
);

/*----------------------------------------------------------------------------*/

router.get('/quiz/:id/comment', getAuth(true, false), async (req, res) => {
  const { id } = req.params;
  const { you } = res.locals;
  const sortDirection = req.query.sort || 'newest';
  const page = parseInt(req.query.page, 10) || 1;
  const count = parseInt(req.query.count, 10) || 50;
  // if data param is not specified it will return user id for all comments
  // for quiz
  const dataOption = req.query.data || 'id';
  const quiz = await Quiz.findById(id);

  const access = getQuizAccess(quiz, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `quiz ${id} does not exist` });
  } if (access === ACCESS.VIEW) {
    return res.status(404).json({ error: `you cannot access quiz ${id}` });
  }
  const sortOrder = sortDirection === 'newest' ? -1 : 1;
  const skip = (page - 1) * count;

  const fields = dataOption === 'id' ? 'user -_id' : '';
  const comments = await Comment.find({ quiz: id })
    .sort({ created: sortOrder })
    .skip(skip)
    .limit(count)
    .select(fields)
    .exec();

  const formattedComments = comments.map((comment) => {
    // the entire json object including quiz id user id comment date aka the
    // entire schema
    if (dataOption === 'all') {
      return comment.toObject();
    }

    // returns the user id - if commented multiple times on one quiz it will
    // return the user id multiple times in json form
    return { user: comment.user };
  });

  return res.status(200).json({ comments: formattedComments });
});

/*----------------------------------------------------------------------------*/

const CreateCommentJoiSchema = Joi.object({
  quiz: Joi.string().custom(isObjectId).required(),
  description: Joi.string().required(),
});

router.post(
  '/comment',
  getAuth(true, false),
  getInput('body', CreateCommentJoiSchema),
  async (req, res) => {
    const { you } = res.locals;
    const { description: commentBody, quiz: id } = req.body;
    const quiz = await Quiz.findById(id);

    const access = getQuizAccess(quiz, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `quiz ${id} does not exist` });
    } if (access === ACCESS.VIEW) {
      return res.status(404).json({ error: `you cannot access quiz ${id}` });
    }

    const newComment = new Comment({
      user: you,
      quiz: id,
      description: commentBody,
      created: new Date(),
    });

    await newComment.save();
    await quiz.updateOne({ totalComments: (quiz.totalComments + 1) });
    return res.status(201).json({
      message: 'Comment added successfully', id: newComment._id,
    });
  },
);

/*----------------------------------------------------------------------------*/

router.put('/comment/:id', getAuth(true, false), async (req, res) => {
  const { id } = req.params;
  const { body: commentBody } = req.body;
  const { you } = res.locals;

  const comment = await Comment.findById(id);

  const access = getCommentAccess(comment, you);
  if (access < ACCESS.VIEW) {
    return res.status(404).json({ error: `comment ${id} does not exist` });
  } if (access < ACCESS.EDIT) {
    return res.status(404).json({ error: `you cannot edit comment ${id}` });
  }

  await comment.updateOne({
    $set: { description: commentBody, updated: new Date() },
  });

  return res.sendStatus(200);
});

/*----------------------------------------------------------------------------*/

module.exports = router;
