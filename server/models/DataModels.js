const mongoose = require('mongoose');

// User Schema (Profile Data)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Student' },
  targetPercentile: { type: String, default: '99' },
  examDate: { type: String, default: '2026-11-29' },
  avatarColor: { type: String, default: '#2563eb' },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });

// Topic Schema
const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: String, required: true },
  section: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: String, default: 'Not Started' },
  custom: { type: Boolean, default: false }
});
// Ensure uniqueness per user
topicSchema.index({ userId: 1, topicId: 1 }, { unique: true });

// Calendar Log Schema
const calendarLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  notes: { type: String, default: '' },
  hours: { type: Number, default: 0 },
  plannedTopics: [{ type: String }]
});
calendarLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Mock Score Schema
const mockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockId: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  varc: { type: Number, default: 0 },
  dilr: { type: Number, default: 0 },
  qa: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});
mockSchema.index({ userId: 1, mockId: 1 }, { unique: true });

// Note Schema (New Feature)
const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Topic: mongoose.model('Topic', topicSchema),
  CalendarLog: mongoose.model('CalendarLog', calendarLogSchema),
  Mock: mongoose.model('Mock', mockSchema),
  Note: mongoose.model('Note', noteSchema)
};
