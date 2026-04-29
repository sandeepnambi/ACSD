const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

const migrateRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users without a role or with an empty role
    const users = await User.find({ $or: [{ role: { $exists: false } }, { role: '' }] });
    console.log(`Found ${users.length} users without a role.`);

    for (const user of users) {
      user.role = 'developer';
      await user.save();
      console.log(`Updated user ${user.username} to developer role.`);
    }

    console.log('Migration completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

migrateRoles();
