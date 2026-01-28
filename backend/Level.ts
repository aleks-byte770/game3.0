import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: String,
  text: String,
  choices: [String],
  correctIndex: Number,
  explanation: String,
});

const levelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  grade: { type: Number, required: true },
  questions: [questionSchema],
  reward: {
    coinsPerCorrect: Number,
    pointsPerCorrect: Number,
  },
});

export const Level = mongoose.model('Level', levelSchema);