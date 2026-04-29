const mongoose = require('mongoose');
require('dotenv').config();
const SmellRule = require('../src/models/SmellRule');

const seedRules = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const defaultRules = [
      {
        name: 'long_method',
        displayName: 'Long Method',
        description: 'Methods that are too long are harder to understand and maintain.',
        threshold: 20,
        unit: 'lines',
        severity: 'medium',
        suggestion: 'Extract method: Break this long method into smaller, more focused methods',
        supportedLanguages: ['python', 'java', 'cpp', 'javascript']
      },
      {
        name: 'large_class',
        displayName: 'Large Class',
        description: 'Classes with too many members usually have too many responsibilities.',
        threshold: 50,
        unit: 'members',
        severity: 'medium',
        suggestion: 'Extract class: Split this large class into smaller, more cohesive classes',
        supportedLanguages: ['python', 'java', 'cpp', 'javascript']
      },
      {
        name: 'excess_parameters',
        displayName: 'Excess Parameters',
        description: 'Methods with too many parameters are difficult to use and test.',
        threshold: 5,
        unit: 'parameters',
        severity: 'medium',
        suggestion: 'Introduce parameter object: Replace multiple parameters with a single object',
        supportedLanguages: ['python', 'java', 'cpp', 'javascript']
      },
      {
        name: 'duplicate_code',
        displayName: 'Duplicate Code',
        description: 'Redundant logic increases maintenance effort and bug risk.',
        threshold: 3,
        unit: 'occurrences',
        severity: 'high',
        suggestion: 'Extract method: Move duplicate code to a shared method',
        supportedLanguages: ['python', 'java', 'cpp', 'javascript']
      },
      {
        name: 'high_complexity',
        displayName: 'High Complexity',
        description: 'Complex code with many branches is difficult to test and prone to errors.',
        threshold: 10,
        unit: 'index',
        severity: 'medium',
        suggestion: 'Refactor complex logic: Break down complex conditions and loops',
        supportedLanguages: ['python', 'java', 'cpp', 'javascript']
      }
    ];

    for (const rule of defaultRules) {
      await SmellRule.findOneAndUpdate(
        { name: rule.name },
        rule,
        { upsert: true, new: true }
      );
    }

    console.log('Successfully seeded smell detection rules');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

seedRules();
