const Joi = require('joi');

// User registration validation
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// User login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    identifier: Joi.string().required().messages({
      'any.required': 'Email or username is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Smell rule validation
const validateSmellRule = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().valid('long_method', 'large_class', 'duplicate_code', 'excess_parameters').required(),
    threshold: Joi.number().min(1).max(1000).required(),
    severity: Joi.string().valid('low', 'medium', 'high').required(),
    supportedLanguages: Joi.array().items(Joi.string().valid(
      'python', 'java', 'cpp'
    )).min(1).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Report query validation
const validateReportQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid('clean', 'minor_issues', 'needs_refactoring'),
    language: Joi.string().valid(
      'python', 'java', 'cpp'
    ),
    dateFrom: Joi.date(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')),
    sortBy: Joi.string().valid('createdAt', 'qualityScore', 'totalSmells').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  req.query = value;
  next();
};

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const allowedExtensions = [
    '.py', '.java', '.cpp', '.hpp'
  ];
  const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ 
      message: `Invalid file type. Supported extensions: ${allowedExtensions.join(', ')}` 
    });
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
  if (req.file.size > maxSize) {
    return res.status(400).json({ 
      message: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB` 
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateSmellRule,
  validateReportQuery,
  validateFileUpload
};
