const router = require('express').Router();

const Joi = require('joi');
const {
  Report, User, Quiz, Comment, Play,
} = require('./db');
const {
  getQuizProjection, getAuth, isObjectId, getInput, getQuizAccess,
  ACCESS, getReportProjection, getUserProjection, getPlayAccess,
  getCommentProjection, getPlayProjection,
} = require('./util');
/*----------------------------------------------------------------------------*/
const ListReportsSchema = Joi.object({
  type: Joi.string().allow('user', 'quiz', 'comment').allow('').default(''),
  user: Joi.string().custom(isObjectId),
  data: Joi.string().valid('all', 'id').default('id'),
  count: Joi.number().min(0).max(100).default(50),
  page: Joi.number().min(0).default(0),
});

/*----------------------------------------------------------------------------*/

router.get(
  '/report',
  getAuth(true, true),
  getInput('query', ListReportsSchema),
  async (req, res) => {
    const {
      type, user, data, count, page,
    } = res.locals.query;
    // Perform search, and show only those visible.
    const pipeline = Report.aggregate();
    // Search for reports that match the type, if type specified
    if (type.length !== 0) {
      pipeline.match({ type });
    }

    // If a specific user is specified, let that be.
    if (user != null) {
      pipeline.match({ user });
    }

    // Sort and paginate.
    pipeline
      .project(getReportProjection(data))
      .skip(page * count)
      .limit(count);

    // Get results.
    const results = await pipeline.exec();
    // Return only id's if that is what the user specified.
    if (data === 'id') {
      results.forEach((v, i) => { results[i] = v.id; });
    }

    res.status(200).json(results);
  },
);

/*----------------------------------------------------------------------------*/
// Given a quiz and play, return true if the "you"
// can see that quiz and play, false otherwise
// If neither exists, also returns true
function canAccess(quiz, play, you) {
  if (quiz && quiz !== undefined && getQuizAccess(quiz, you) < ACCESS.VIEW) {
    return false;
  }
  if (play && play !== undefined && getPlayAccess(play, you) < ACCESS.VIEW) {
    return false;
  }
  return true;
}

function whichNotNull(user, quiz, comment, play) {
  if (user && user !== undefined) {
    return 'user';
  }
  if (quiz && quiz !== undefined) {
    return 'quiz';
  }
  if (comment && comment !== undefined) {
    return 'comment';
  }
  if (play && play !== undefined) {
    return 'play';
  }
  return '';
}
const CreateReportSchema = Joi.object({
  type: Joi.string().valid('user', 'quiz', 'comment', 'play').default(''),
  id: Joi.string().custom(isObjectId),
  reason: Joi.string().min(1).required(),
});

router.post(
  '/report',
  getAuth(true, false),
  getInput('body', CreateReportSchema),
  async (req, res) => {
    const { you } = res.locals;
    const { type, id, reason } = res.locals.body;
    // Because we may need to reassign type's value if type unspecified
    // we need a new non-const type.
    let newType = type;
    // Ok, so you may be thinking "why not use a switch"
    // It's because handleing the default case (where type was unspecified) was
    // a headache, So I did this instead
    const user = await User.findById(id, getUserProjection('id')).lean();
    if (type === 'user') {
      if ((user === null || user === undefined)) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
    }

    const quiz = await Quiz.findById(id, getQuizProjection('id')).lean();
    if (type === 'quiz') {
      if (quiz === null || quiz === undefined) {
        res.status(404).json({ error: `${type} ${id} does not exist` });
      }
      if (getQuizAccess(quiz, you) < ACCESS.VIEW) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
    }

    const comment = await Comment
      .findById(id, getCommentProjection('id'))
      .lean();

    if (type === 'comment') {
      if (comment == null) {
        res.status(404).json({ error: `${type} ${id} does not exist` });
      }
    }

    const play = await Play.findById(id, getPlayProjection('id')).lean();
    if (type === 'play') {
      if (play == null) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
      if (getPlayAccess(play, you) < ACCESS.VIEW) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
    }

    if (type == null || type.length === 0) {
      if (user == null && comment == null && quiz == null && play == null) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
      if (!canAccess(quiz, play, you)) {
        return res.status(404).json({ error: `${type} ${id} does not exist` });
      }
      newType = whichNotNull(user, quiz, comment, play);
    }
    if (!newType || newType.length === 0) {
      return res.status(401).json({ error: 'invalid type' });
    }
    try {
      const report = new Report({
        type: newType,
        item: id,
        reason,
        reporter: you.id,
        created: new Date(),
      });
      await report.save();
      return res.status(201).json({ reports: report.id });
    } catch (err) {
      return res.status(500).json({ error: 'internal server error' });
    }
  },
);

/*----------------------------------------------------------------------------*/
const IdSchema = Joi.object({
  id: Joi.string().custom(isObjectId),
});

router.get(
  '/report/:id',
  getAuth(true, true),
  getInput('params', IdSchema),
  async (req, res) => {
    const { id } = res.locals.params;
    const report = await Report.findById(id);
    if (report === null || report === undefined) {
      return res.status(404).send({
        error: `report with id ${id} does not exist`,
      });
    }
    return res.status(200).json(report);
  },
);

/*----------------------------------------------------------------------------*/

router.delete(
  '/report/:id',
  getAuth(true, true),
  getInput('params', IdSchema),
  async (req, res) => {
    const { id } = res.locals.params;
    const report = await Report.findById(id);
    if (report === null || report === undefined) {
      return res.status(404).send({
        error: `report with id ${id} does not exist`,
      });
    }
    await report.deleteOne();
    return res.status(200);
  },
);

/*----------------------------------------------------------------------------*/
module.exports = router;
