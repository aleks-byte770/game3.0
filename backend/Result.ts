import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  levelId: { type: String, required: true },
  grade: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  coinsEarned: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const Result = mongoose.model('Result', resultSchema);