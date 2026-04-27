const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const checkUsers = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI || 'mongodb://localhost:27017/acsd_database');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acsd_database');
    const count = await User.countDocuments();
    console.log('Total users in database:', count);
    const users = await User.find({}, 'username email role');
    console.log('Users:', users);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkUsers();
