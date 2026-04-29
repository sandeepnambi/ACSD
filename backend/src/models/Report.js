const mongoose = require('mongoose');

const codeSmellSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['long_method', 'large_class', 'duplicate_code', 'excess_parameters', 'high_complexity']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  location: {
    line: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      default: 0
    },
    functionName: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    }
  },
  description: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    required: true
  },
  metricValue: {
    type: Number,
    required: true
  }
});

const metricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  }
});

const reportSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  codeContent: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileLanguage: {
    type: String,
    required: true,
    enum: ['python', 'java', 'cpp', 'c', 'javascript', 'typescript', 'go', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'other']
  },
  fileSize: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  codeSmells: [codeSmellSchema],
  metrics: [metricSchema],
  summary: {
    totalSmells: {
      type: Number,
      default: 0
    },
    criticalSmells: {
      type: Number,
      default: 0
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    status: {
      type: String,
      enum: ['clean', 'minor_issues', 'needs_refactoring'],
      default: 'clean'
    }
  },
  analysisDuration: {
    type: Number, // in milliseconds
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + (process.env.REPORT_RETENTION_DAYS || 90) * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ expiresAt: 1 });

// Calculate summary before saving
reportSchema.pre('save', function(next) {
  this.summary.totalSmells = this.codeSmells.length;
  this.summary.criticalSmells = this.codeSmells.filter(smell => smell.severity === 'high').length;
  
  // Calculate quality score with weighted penalties
  // High: -7 points, Medium: -3 points, Low: -1 point
  let penalty = 0;
  this.codeSmells.forEach(smell => {
    if (smell.severity === 'high') penalty += 7;
    else if (smell.severity === 'medium') penalty += 3;
    else penalty += 1;
  });
  
  this.summary.qualityScore = Math.max(0, 100 - penalty);
  
  // Determine status
  if (this.summary.totalSmells === 0) {
    this.summary.status = 'clean';
  } else if (this.summary.criticalSmells > 0 || this.summary.totalSmells > 5 || this.summary.qualityScore < 70) {
    this.summary.status = 'needs_refactoring';
  } else {
    this.summary.status = 'minor_issues';
  }
  
  next();
});

// Static method to find expired reports
reportSchema.statics.findExpired = function() {
  return this.find({ expiresAt: { $lt: new Date() } });
};

// Static method to cleanup expired reports
reportSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('Report', reportSchema);
