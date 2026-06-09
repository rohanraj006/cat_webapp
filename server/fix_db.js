require('dotenv').config();
const mongoose = require('mongoose');

async function fixDb() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_webapp');
  console.log('Connected to DB');

  try {
    await mongoose.connection.collection('topics').dropIndexes();
    console.log('Dropped topics indexes');
  } catch (e) { console.log('No topics indexes to drop or error:', e.message); }

  try {
    await mongoose.connection.collection('calendarlogs').dropIndexes();
    console.log('Dropped calendarlogs indexes');
  } catch (e) { console.log('No calendarlogs indexes to drop or error:', e.message); }

  try {
    await mongoose.connection.collection('mocks').dropIndexes();
    console.log('Dropped mocks indexes');
  } catch (e) { console.log('No mocks indexes to drop or error:', e.message); }

  console.log('Done fixing indexes.');
  process.exit(0);
}

fixDb();
