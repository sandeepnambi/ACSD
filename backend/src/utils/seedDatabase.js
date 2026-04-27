const mongoose = require('mongoose');
const User = require('../models/User');
const SmellRule = require('../models/SmellRule');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/acsd_database';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await SmellRule.deleteMany({});
    
    console.log('Creating default users...');
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123'
    });
    await adminUser.save();
    
    // Create senior developer user
    const seniorUser = new User({
      username: 'senior',
      email: 'senior@example.com',
      password: 'senior123'
    });
    await seniorUser.save();
    
    // Create junior developer user
    const juniorUser = new User({
      username: 'junior',
      email: 'junior@example.com',
      password: 'junior123'
    });
    await juniorUser.save();
    
    console.log('Creating default smell detection rules...');
    
    const defaultRules = [
      {
        name: 'long_method',
        displayName: 'Long Method',
        description: 'A method that is too long and should be broken down into smaller methods',
        threshold: 20,
        unit: 'lines',
        severity: 'medium',
        suggestion: 'Extract method: Break this long method into smaller, more focused methods',
        supportedLanguages: ['python', 'java']
      },
      {
        name: 'large_class',
        displayName: 'Large Class',
        description: 'A class that has too many responsibilities and should be split',
        threshold: 50,
        unit: 'members',
        severity: 'medium',
        suggestion: 'Extract class: Split this large class into smaller, more cohesive classes',
        supportedLanguages: ['python', 'java']
      },
      {
        name: 'duplicate_code',
        displayName: 'Duplicate Code',
        description: 'Identical or similar code blocks that appear in multiple places',
        threshold: 3,
        unit: 'occurrences',
        severity: 'high',
        suggestion: 'Extract method: Move duplicate code to a shared method',
        supportedLanguages: ['python', 'java']
      },
      {
        name: 'excess_parameters',
        displayName: 'Excess Parameters',
        description: 'A method with too many parameters that should be simplified',
        threshold: 5,
        unit: 'parameters',
        severity: 'medium',
        suggestion: 'Introduce parameter object: Replace multiple parameters with a single object',
        supportedLanguages: ['python', 'java']
      }
    ];
    
    for (const ruleData of defaultRules) {
      const rule = new SmellRule(ruleData);
      await rule.save();
    }
    
    console.log('Database seeded successfully!');
    console.log('\nDefault users created:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Senior: senior@example.com / senior123');
    console.log('Junior: junior@example.com / junior123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
