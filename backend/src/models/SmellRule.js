const mongoose = require('mongoose');

const smellRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['long_method', 'large_class', 'duplicate_code', 'excess_parameters', 'high_complexity']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  threshold: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  suggestion: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  supportedLanguages: [{
    type: String,
    enum: ['python', 'java', 'cpp', 'c', 'javascript', 'typescript', 'go', 'ruby', 'php', 'swift', 'kotlin', 'rust']
  }],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
smellRuleSchema.index({ name: 1, isActive: 1 });

// Static method to get active rules for a specific language
smellRuleSchema.statics.getActiveRules = function(language) {
  return this.find({
    isActive: true,
    supportedLanguages: language
  }).sort({ name: 1 });
};

// Static method to get rule by name
smellRuleSchema.statics.getRuleByName = function(name) {
  return this.findOne({ name, isActive: true });
};

// Pre-save validation
smellRuleSchema.pre('save', function(next) {
  // Validate threshold based on rule type
  switch (this.name) {
    case 'long_method':
      if (this.threshold < 5 || this.threshold > 100) {
        return next(new Error('Long method threshold must be between 5 and 100 lines'));
      }
      break;
    case 'large_class':
      if (this.threshold < 10 || this.threshold > 500) {
        return next(new Error('Large class threshold must be between 10 and 500 members'));
      }
      break;
    case 'excess_parameters':
      if (this.threshold < 2 || this.threshold > 20) {
        return next(new Error('Excess parameters threshold must be between 2 and 20'));
      }
      break;
    case 'duplicate_code':
      if (this.threshold < 2 || this.threshold > 50) {
        return next(new Error('Duplicate code threshold must be between 2 and 50 occurrences'));
      }
      break;
  }
  next();
});

module.exports = mongoose.model('SmellRule', smellRuleSchema);
