require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Topic, CalendarLog, Mock, Note } = require('./models/DataModels');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_webapp')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Contains user id from token
    next();
  });
};

// --- Auth & User Routes (Public) ---
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, name, targetPercentile, examDate } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      name: name || username,
      targetPercentile: targetPercentile || '99',
      examDate: examDate || '2026-11-29'
    });

    await newUser.save();
    
    // Auto-login after signup
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: newUser._id, username: newUser.username, name: newUser.name, targetPercentile: newUser.targetPercentile, examDate: newUser.examDate, avatarColor: newUser.avatarColor, profilePicture: newUser.profilePicture } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, username: user.username, name: user.name, targetPercentile: user.targetPercentile, examDate: user.examDate, avatarColor: user.avatarColor, profilePicture: user.profilePicture } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// --- Protected Routes (Require Token) ---
app.use('/api', authenticateToken);

// --- User Profile Routes ---
app.put('/api/user', async (req, res) => {
  try {
    const updateData = req.body;
    // Don't allow password updates here for simplicity
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.put('/api/user/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/user/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// --- Topics Routes ---
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user.id });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topics' });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const newTopic = new Topic({ ...req.body, userId: req.user.id });
    await newTopic.save();
    res.json(newTopic);
  } catch (error) {
    res.status(500).json({ message: 'Error creating topic' });
  }
});

app.put('/api/topics/:topicId', async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { topicId: req.params.topicId, userId: req.user.id }, 
      { ...req.body, userId: req.user.id }, 
      { new: true, upsert: true }
    );
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Error updating topic' });
  }
});

app.delete('/api/topics/:topicId', async (req, res) => {
  try {
    await Topic.findOneAndDelete({ topicId: req.params.topicId, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting topic' });
  }
});

// --- Calendar Log Routes ---
app.get('/api/calendarLogs', async (req, res) => {
  try {
    const logs = await CalendarLog.find({ userId: req.user.id });
    const logsObj = {};
    logs.forEach(log => {
      logsObj[log.date] = { notes: log.notes, hours: log.hours, plannedTopics: log.plannedTopics };
    });
    res.json(logsObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar logs' });
  }
});

app.put('/api/calendarLogs/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { notes, hours, plannedTopics } = req.body;
    if (!notes && !hours && (!plannedTopics || plannedTopics.length === 0)) {
      await CalendarLog.findOneAndDelete({ date, userId: req.user.id });
      return res.json({ deleted: true });
    }
    const log = await CalendarLog.findOneAndUpdate(
      { date, userId: req.user.id }, 
      { ...req.body, userId: req.user.id }, 
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error updating calendar log' });
  }
});

// --- Mock Routes ---
app.get('/api/mocks', async (req, res) => {
  try {
    const mocks = await Mock.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(mocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mocks' });
  }
});

app.post('/api/mocks', async (req, res) => {
  try {
    const newMock = new Mock({ ...req.body, userId: req.user.id });
    await newMock.save();
    res.json(newMock);
  } catch (error) {
    res.status(500).json({ message: 'Error creating mock' });
  }
});

app.delete('/api/mocks/:mockId', async (req, res) => {
  try {
    await Mock.findOneAndDelete({ mockId: req.params.mockId, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mock' });
  }
});

// --- Notes Routes ---
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const newNote = new Note({ ...req.body, userId: req.user.id });
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Initialize Default Topics
app.post('/api/init-defaults', async (req, res) => {
  try {
    const count = await Topic.countDocuments({ userId: req.user.id });
    if (count === 0 && req.body.topics) {
      const topicsWithUser = req.body.topics.map(t => ({ ...t, userId: req.user.id }));
      await Topic.insertMany(topicsWithUser);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing defaults' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
