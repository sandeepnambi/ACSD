const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const username = 'Sandeep Nambi';
    const user = await User.findOne({ username });

    if (!user) {
      console.error(`User '${username}' not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Successfully updated '${username}' to role: admin`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

makeAdmin();
