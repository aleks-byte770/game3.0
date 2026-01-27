import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
  },
  // Поля специфичные для ученика
  grade: {
    type: Number,
    default: 1,
  },
  coins: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  completedLevels: [{
    type: String // ID уровней
  }],
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);