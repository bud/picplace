const router = require('express').Router();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const Joi = require('joi');
const {
  Play, Quiz, User,
} = require('./db');

const { ObjectId } = mongoose.Types;
const {
  getAuth, isObjectId, getInput,
  getQuizAccess, ACCESS,
  getPlayAccess, getPlayProjection,
  isJSONable,
  isReservedForImages,
  upload,
} = require('./util');
const { compareImages } = require('./images');

/*----------------------------------------------------------------------------*/
const ListPlaysSchema = Joi.object({
  user: Joi.string().custom(isObjectId),
  quiz: Joi.string().custom(isObjectId),
  sort: Joi.string().valid('time', 'totalScore', 'created')
    .default('totalScore'),
  data: Joi.string().valid('all', 'id').default('id'),
  count: Joi.number().default(50),
  page: Joi.number().default(0),
});

router.get(
  '/play',
  getAuth(false, false),
  getInput('query', ListPlaysSchema),
  async (req, res) => {
    const {
      user, quiz, sort, data, count, page,
    } = res.locals.query;

    /** @type {InstanceType<User>} */
    const { _id: uid, admin } = res.locals.you ?? {};

    // Perform search, and show only those visible.
    const pipeline = Play.aggregate();

    // Match quizzes if necessary.
    if (quiz != null && quiz.length !== 0) {
      pipeline.match({ quiz });
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
      .project(getPlayProjection(data))
      .sort({ [sort]: 'desc', id: 'asc' })
      .skip(page * count)
      .limit(count);

    // Get results.
    const results = await pipeline.exec();

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
  id: Joi.string().custom(isObjectId).required(),
});

router.get(
  '/play/:id',
  getAuth(true, false),
  getInput('params', GetQuizSchema),
  async (req, res) => {
    const { you } = res.locals;
    const { id } = res.locals.params;

    const play = await Play.findById(id, getPlayProjection('all')).lean();

    if (getPlayAccess(play, you) < ACCESS.VIEW) {
      return res.status(404).json({ error: `play ${id} does not exist` });
    }

    return res.status(200).json(play);
  },
);

/*----------------------------------------------------------------------------*/

const PlayCreateSchema = Joi.object({
  quiz: Joi.string().custom(isObjectId).required(),
});

router.post(
  '/play',
  getAuth(true, false),
  getInput('body', PlayCreateSchema),
  async (_, res) => {
    const { you } = res.locals;
    const { quiz: quizID } = res.locals.body;

    const quiz = await Quiz.findById(quizID).lean();

    if (getQuizAccess(quiz, you) < ACCESS.VIEW) {
      return res.status(404).json({ error: `Quiz ${quizID} does not exist` });
    }

    const play = new Play({
      version: quiz.version,
      quiz: quizID,
      user: you.id,
      guesses: (new Array(quiz.questions.length)).fill(null),
      scores: [],
      public: false,
      start: new Date(),
    });

    await play.save();

    return res.json({ id: play.id });
  },
);

/*----------------------------------------------------------------------------*/

const GuessSchema = Joi.object({
  type: Joi.string().required().valid('choice', 'location', 'match', 'blank'),
  guess: Joi.string(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  match: Joi.alternatives().try(Joi.string(), Joi.number()),
});

const UpdateAnswersSchema = Joi.object({
  guesses: Joi.any().custom(isJSONable(
    Joi
      .array()
      .items(GuessSchema, null)
      .required(),
  )),
  images: Joi.any().custom(isReservedForImages),
  final: Joi.boolean(),
});

router.put(
  '/play/:playId/guesses',
  getAuth(true),
  upload.array('images'),
  getInput('body', UpdateAnswersSchema),
  async (req, res) => {
    const { you } = res.locals;
    const { playId } = req.params;
    let { guesses, final } = req.body;
    guesses = JSON.parse(guesses);

    // Fetch the play session
    const play = await Play.findById(playId).populate('quiz');
    if (!play) {
      return res.status(404).json({
        error: `Play session ${playId} does not exist`,
      });
    }

    // Check user's access to the play session
    const access = getPlayAccess(play, you);
    if (access < ACCESS.EDIT) {
      return res.status(403).json({
        error: `Unauthorized access to play session ${playId}`,
      });
    }

    // Setup image files.
    const stored = new Map();

    for await (const guess of guesses) {
      // console.log(guess);
      if (guess == null) continue;
      if (typeof guess.match !== 'number') continue;

      // Check if the file indicated by the number exists.
      const file = req.files.at(guess.match);
      if (file == null) {
        return res.status(400).json({
          error: `image #${guess.match} not found`,
        });
      }

      // Replace the number with the file's URL, and create that if not already.
      if (stored.has(guess.match)) {
        guess.match = stored.get(guess.match);
      } else {
        // console.log(file);
        const image = `/files/${file.filename}`;
        await fs.rename(file.path, `public/files/${file.filename}`);
        stored.set(guess.match, image);
        guess.match = image;
      }
    }

    const quiz = await Quiz.findById(play.quiz);

    // Calculate scores based on the answers
    let totalScore = 0;
    const scores = await Promise.all(guesses.map(async (guess, id) => {
      if (guess == null) {
        return 0;
      }
      const question = quiz.questions[id];
      if (!question) {
        return null;
      }
      let isCorrect = false;
      let points = 0;

      switch (question.type) {
        case 'choice':
          console.log("SDFDF",question.choices, question.answer, guess.guess);
          isCorrect = (question.choices[question.answer] === guess.guess);
          points = isCorrect ? 10 : 0;
          break;
        case 'location':
          const latDiff = Math.abs(question.latitude - guess.latitude);
          const lonDiff = Math.abs(question.longitude - guess.longitude);
          isCorrect = (1 / latDiff <= 0.01 && lonDiff <= 0.01);
          points = Math.min(10, 1 / (latDiff + lonDiff));
          break;
        case 'match':
          // console.log('guess and question', guess, question);
          const similarityScore = (
            await compareImages(guess.match, question.image)
          );
          isCorrect = similarityScore.mssim >= 0.8;
          points = similarityScore * 10;
          break;
        case 'blank':
          isCorrect = true;
          points = 0;
          break;
        default:
          break;
      }
      totalScore += points;
      return points;
    }));

    // Update the play session
    play.guesses = guesses;
    play.scores = scores;
    play.totalScore = totalScore;
    if (final) {
      play.isScored = true;
      play.end = new Date();
    }
    await play.save();

    // Return the updated play session with scores
    return res.status(200).json({
      message: 'Solutions submitted and scores calculated successfully',
      play,
    });
  },
);

router.post('/play/finalpoints', getAuth(true, false), async (req, res) => {
  const { you } = res.locals;
  const { quiz: quizId, guesses } = req.body;

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    return res.status(404).json({ error: `Quiz ${quizId} does not exist` });
  }
  // console.log('Received guesses:', guesses);

  if (getQuizAccess(quiz, you) < ACCESS.VIEW) {
    return res.status(403).json({
      error: `Unauthorized access to quiz ${quizId}`,
    });
  }

  const proximityThreshold = 0.01;

  let totalScore = 0;
  const processedGuesses = await Promise.all(guesses.map(async (guess) => {
    const question = quiz.questions.find((q) => q._id.toString() === guess.questionId);
    if (!question) {
      return null;
    }
    let isCorrect = false;
    let points = 0;

    switch (question.type) {
      case 'choice':
        isCorrect = (question.answer === guess.guess);
        points = isCorrect ? 10 : 0;
        break;
      case 'location':
        const latDiff = Math.abs(question.latitude - guess.latitude);
        const lonDiff = Math.abs(question.longitude - guess.longitude);
        isCorrect = (latDiff <= proximityThreshold && lonDiff <= proximityThreshold);
        points = isCorrect ? 10 : 0;
        break;
      case 'match':
        const similarityScore = await compareImages(guess.image, question.answer);
        const someThresholdValue = 0.8;
        isCorrect = similarityScore.mssim >= someThresholdValue;
        points = isCorrect ? 10 : 0;
        break;

      case 'blank':
        isCorrect = (question.answer.toLowerCase() === guess.text.toLowerCase());
        points = isCorrect ? 10 : 0;
        break;
      default:
        break;
    }
    totalScore += points;
    return {
      ...guess,
      isCorrect,
      points,
    };
  }));

  const filteredGuesses = processedGuesses.filter((g) => g !== null); // Filter out any null guesses
  // console.log('here');

  try {
    const play = new Play({
      version: quiz._id,
      quiz: quiz._id,
      user: you._id,
      guesses: filteredGuesses,
      public: quiz.public,
      start: new Date(),
      end: new Date(),
      totalScore,
      scores: filteredGuesses.map((guess) => guess.points),
      isScored: true,
    });

    await play.save();
    return res.status(201).json({
      playId: play._id, message: 'Play session created successfully.',
    });
  } catch (error) {
    console.error('Failed to save play session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/*----------------------------------------------------------------------------*/
// GET /leaderboard - Retrieve the global leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const mostActivePlayers = await Play.aggregate([
      {
        $group: {
          _id: '$user',
          numberOfPlays: { $sum: 1 }, // Count the number of plays per user
          lastPlayed: { $last: '$start' }, // Track the last play date
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails', // Unwind the userDetails for easy access
      },
      {
        $project: {
          _id: 0,
          username: '$userDetails.username',
          numberOfPlays: 1,
          lastPlayed: 1,
        },
      },
      {
        $sort: { numberOfPlays: -1 }, // Sort by numberOfPlays descending
      },
      {
        $limit: 10, // Limit to top 10 most active users
      },
    ]);

    res.status(200).json(mostActivePlayers);
  } catch (error) {
    console.error(
      'Failed to retrieve leaderboard for most active players:',
      error,
    );
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*----------------------------------------------------------------------------*/

router.get('/leaderboard/:id', async (req, res) => {
  const quizId = new ObjectId(req.params.id);
  try {
    const topScores = await Play.aggregate([
      {
        $match: { quiz: quizId }, // Filter plays by quiz ID
      },
      {
        $group: {
          _id: '$user',
          highScore: { $max: '$totalScore' },
          lastPlayed: { $last: '$start' },
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 0,
          username: '$userDetails.username',
          highScore: 1,
          lastPlayed: 1,
        },
      },
      {
        $sort: { highScore: -1 }, // Sort by highScore descending
      },
      {
        $limit: 10, // Limit to top 10 scores for the specified quiz
      },
    ]);

    res.status(200).json(topScores);
  } catch (error) {
    console.error('Failed to retrieve leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*----------------------------------------------------------------------------*/
const DeletePlaySchema = Joi.object({
  id: Joi.string().custom(isObjectId),
});
router.delete(
  '/play/:id',
  getAuth(true, false),
  getInput('params', DeletePlaySchema),
  async (req, res) => {
    const { id } = res.locals.params;
    const play = await Play.findById(id);
    const { you } = res.locals;
    if (!play || play === undefined) {
      return res.status(404).json({ error: `Play ${id} does not exist` });
    }
    const access = getPlayAccess(play, you);
    if (access < ACCESS.VIEW) {
      return res.status(404).json({ error: `Play ${id} does not exist` });
    }
    if (access === ACCESS.VIEW) {
      return res.status(403).json({ error: 'you are unauthorized' });
    }
    // Remove from the trophy room later
    const user = await User.findById(you.id);
    const { trophies } = user;
    for (let i = 0; i < trophies.length; i += 1) {
      if (trophies[i].toString() === play.id) {
        trophies.splice(i, 1);
        // console.log(trophies);
        // eslint-disable-next-line no-await-in-loop
        await user.updateOne({ trophies });
      }
    }
    await play.deleteOne();
    return res.status(200);
  },
);

/*----------------------------------------------------------------------------*/
// GET /leaderboard - Retrieve the global leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await Play.aggregate([
      {
        $group: {
          _id: '$user',
          highScore: { $max: '$totalScore' },
          lastPlayed: { $last: '$start' },
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 0,
          username: '$userDetails.username',
          highScore: 1,
          lastPlayed: 1,
        },
      },
      {
        $sort: { highScore: -1 },
      },
      {
        $limit: 10, // Limit to top 10 scores
      },
    ]);

    res.status(200).json(topScores);
  } catch (error) {
    console.error('Failed to retrieve leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*----------------------------------------------------------------------------*/
const GetQuestionsSchema = Joi.object({
  id: Joi.string().custom(isObjectId),
});

router.get(
  '/play/:id/questions',
  getAuth(true, false),
  getInput('params', GetQuestionsSchema),
  async (_, res) => {
    const id = res.locals.params.id.toString();
    const { you } = res.locals;
    const play = await Play.findById(id, getPlayProjection('all')).lean();
    if (!play || play === undefined) {
      return res.status(404).json({ error: `play ${id} does not exist` });
    }
    const access = getPlayAccess(play, you);
    if (access === ACCESS.NONE) {
      return res.status(404).json({ error: `play ${id} does not exist` });
    }
    if (access === ACCESS.VIEW) {
      return res.status(403).json({ error: 'you are unauthorized' });
    }
    const quiz = await Quiz.findById(play.quiz.toString());
    if (quiz == null) {
      return res.status(404).json({
        error: `quiz ${play.quiz} does not exist`,
      });
    }
    if (play.version.toString() !== quiz.version.toString()) {
      return res.status(410).json({ error: 'play version is out of date' });
    }
    const { questions } = quiz;
    return res.status(200).json({ questions });
  },
);

/*----------------------------------------------------------------------------*/

module.exports = router;
