const {
  default: mongoose, Schema, SchemaTypes: { ObjectId },
} = require('mongoose');

mongoose.pluralize(null);

/*----------------------------------------------------------------------------*/

// Connect to the MongoDB.
const { MONGODB } = process.env;
const API = `mongodb+srv://team9:${MONGODB}@team9.mhylm93.mongodb.net/picplace`;

mongoose.connect(API);

/*----------------------------------------------------------------------------*/

// This is a comment on a quiz.
const CommentSchema = new Schema({
  user: ObjectId,
  quiz: ObjectId,
  description: String,
  created: { type: Date, required: true },
});

const Comment = mongoose.model('comment', CommentSchema);

/*----------------------------------------------------------------------------*/

// This the base propperties all questions in a quiz must have.
const QuestionSchema = new Schema({
  name: String,
  description: String,
  image: String,
}, { _id: false, discriminatorKey: 'type' });

// This is the total schema for a quiz.
const QuizSchema = new Schema({
  // Every time the QUESTIONS in the quiz are updated, the version increments.
  version: { type: Number, required: true },
  user: ObjectId,
  questions: { type: [QuestionSchema], required: true },
  name: String,
  description: String,
  thumbnail: String,
  timelimit: Number,
  // Total comments/likes are temp counters stored by us to make querying
  // easier.
  totalComments: { type: Number, required: true },
  totalLikes: { type: Number, required: true },
  created: { type: Date, required: true },
  // Can a general person see it?
  public: { type: Boolean, required: true },
  // Which people MUST see this quiz?
  whitelist: { type: [ObjectId], required: true },
});

// The following are different schemas for the different types of questions.

QuizSchema.path('questions').discriminator('blank', new Schema({
}));

QuizSchema.path('questions').discriminator('choice', new Schema({
  choices: { type: [String], required: true },
  answer: { type: Number, required: true },
}));

QuizSchema.path('questions').discriminator('location', new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}));

QuizSchema.path('questions').discriminator('match', new Schema({
}));

const Quiz = mongoose.model('quiz', QuizSchema);

/*----------------------------------------------------------------------------*/

// The schema for a type of answer for a play.
const GuessSchema = new Schema({
  name: String,
  description: String,
  image: String,
}, { _id: false, discriminatorKey: 'type' });

// The schema for a session of play of a quiz.
const PlaySchema = new Schema({
  // The version of the quiz that is being played. If different, do not attempt
  // to show personalized Q&A on it.
  version: { type: Number, required: true },
  quiz: ObjectId,
  user: ObjectId,
  guesses: { type: [GuessSchema], required: true },
  // Can the average person see it?
  public: { type: Boolean, required: true },
  // If the user started the session, this must be a date.
  start: Date,
  // If the user finished the session, this must be a date.
  end: Date,
  totalScore: Number,
  scores: { type: [Number] },
  isScored: { type: Boolean },
});

// Different types of valid answers.

PlaySchema.path('guesses').discriminator('blank', new Schema({
}));

PlaySchema.path('guesses').discriminator('choice', new Schema({
  guess: { type: String, required: true },
}));

PlaySchema.path('guesses').discriminator('location', new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}));

PlaySchema.path('guesses').discriminator('match', new Schema({
  match: { type: String, required: true },
}));

const Play = mongoose.model('play', PlaySchema);

/*----------------------------------------------------------------------------*/

// The schema fora user.
const UserSchema = new Schema({
  // Users should probably have a username & password.
  username: { type: String, required: true },
  // THIS MUST BE ENCRYPTED.
  password: { type: String, required: true },
  description: String,
  profile: String,
  created: { type: Date, required: true },
  isFollowing: { type: [ObjectId], required: true },
  isLiking: { type: [ObjectId], required: true },
  // Fancy counters stored by us for easier searching.
  totalFollowers: { type: Number, required: true },
  totalLikes: { type: Number, required: true },
  admin: { type: Boolean, required: true },
  trophies: { type: [ObjectId], required: true },
});

const User = mongoose.model('user', UserSchema);

/*----------------------------------------------------------------------------*/

// The reports for admins to see.
const ReportSchema = new Schema({
  type: {
    type: String,
    enum: ['comment', 'user', 'quiz', 'play'],
    required: true,
  },
  item: { type: ObjectId, required: true },
  reason: String,
  reporter: ObjectId,
  created: { type: Date, required: true },
});

const Report = mongoose.model('report', ReportSchema);

/*----------------------------------------------------------------------------*/

const LeaderboardSchema = new Schema({
  user: {
    type: ObjectId, ref: 'User', required: true, unique: true,
  },
  highScore: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const Leaderboard = mongoose.model('leaderboard', LeaderboardSchema);

/*----------------------------------------------------------------------------*/
const QuizLeaderboardSchema = new Schema({
  quiz: { type: ObjectId, ref: 'Quiz', required: true },
  scores: [{
    user: { type: ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
});

const QuizLeaderboard = (
  mongoose.model('quizLeaderboard', QuizLeaderboardSchema)
);
/*----------------------------------------------------------------------------*/

module.exports = {
  UserSchema,
  User,
  PlaySchema,
  Play,
  QuestionSchema,
  GuessSchema,
  QuizSchema,
  Quiz,
  CommentSchema,
  Comment,
  ReportSchema,
  Report,
  LeaderboardSchema,
  Leaderboard,
  QuizLeaderboardSchema,
  QuizLeaderboard,
};
