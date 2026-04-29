const mongoose = require('mongoose');
require('dotenv').config();

async function updateEmails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Fetching users with @acsd.com emails...');
    const users = await mongoose.connection.db.collection('users').find({
      email: { $regex: /@acsd\.com$/ }
    }).toArray();
    
    console.log(`Found ${users.length} users to update.`);
    
    for (const user of users) {
      const newEmail = user.email.replace('@acsd.com', '@gmail.com');
      console.log(`Updating ${user.email} -> ${newEmail}`);
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $set: { email: newEmail } }
      );
    }
    
    console.log('Database update completed successfully!');
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateEmails();
