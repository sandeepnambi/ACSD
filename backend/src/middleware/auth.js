const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Authorize middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Check if user can access resource (own resource or admin)
const canAccessResource = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  // Check if user is accessing their own resource
  
  // Users can only access their own resources, admins can access everything
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Access denied. You do not have permission to access this resource.' 
  });
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  canAccessResource
};
