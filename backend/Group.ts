import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

export const Group = mongoose.model('Group', groupSchema);