const mongoose = require('mongoose');
require('dotenv').config();

async function list() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  for (const coll of collections) {
    const count = await mongoose.connection.db.collection(coll.name).countDocuments();
    console.log(`Collection: ${coll.name}, Count: ${count}`);
    if (coll.name === 'users') {
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log('Users found:', users.map(u => ({ username: u.username, email: u.email })));
    }
  }
  
  await mongoose.disconnect();
}

list();
