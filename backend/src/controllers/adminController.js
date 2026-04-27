const User = require('../models/User');
const Report = require('../models/Report');
const SmellRule = require('../models/SmellRule');
const bcrypt = require('bcryptjs');

class AdminController {
  // Get system statistics
  getSystemStats = async (req, res) => {
    try {
      const [
        totalUsers,
        totalReports,
        totalAnalyses,
        activeUsers,
        recentReports
      ] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments(),
        Report.countDocuments(),
        User.countDocuments({ isActive: true }),
        Report.find().sort({ createdAt: -1 }).limit(5).select('fileName createdAt summary.qualityScore')
      ]);

      const stats = {
        totalUsers,
        totalReports,
        totalAnalyses,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentReports
      };

      res.json({
        message: 'System statistics retrieved successfully',
        stats
      });

    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get system statistics', 
        error: error.message 
      });
    }
  };

  // Get all users
  getUsers = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = {};
      
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }
      
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .select('-password')
          .lean(),
        User.countDocuments(filter)
      ]);

      res.json({
        message: 'Users retrieved successfully',
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        message: 'Failed to get users', 
        error: error.message 
      });
    }
  };

  // Update user
  updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive, username, email } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields
      if (isActive !== undefined) user.isActive = isActive;
      if (username) user.username = username;
      if (email) user.email = email;

      await user.save();

      res.json({
        message: 'User updated successfully',
        user
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        message: 'Failed to update user', 
        error: error.message 
      });
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't allow deleting yourself
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      await User.findByIdAndDelete(userId);
      await Report.deleteMany({ userId: userId });

      res.json({
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        message: 'Failed to delete user', 
        error: error.message 
      });
    }
  };

  // Get smell rules
  getSmellRules = async (req, res) => {
    try {
      const rules = await SmellRule.find({}).sort({ name: 1 });

      res.json({
        message: 'Smell rules retrieved successfully',
        rules
      });

    } catch (error) {
      console.error('Get smell rules error:', error);
      res.status(500).json({ 
        message: 'Failed to get smell rules', 
        error: error.message 
      });
    }
  };

  // Update smell rule
  updateSmellRule = async (req, res) => {
    try {
      const { ruleId } = req.params;
      const { threshold, severity, isActive, supportedLanguages } = req.body;

      const rule = await SmellRule.findById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: 'Rule not found' });
      }

      // Update fields
      if (threshold !== undefined) rule.threshold = threshold;
      if (severity !== undefined) rule.severity = severity;
      if (isActive !== undefined) rule.isActive = isActive;
      if (supportedLanguages) rule.supportedLanguages = supportedLanguages;
      
      rule.lastUpdatedBy = req.user._id;

      await rule.save();

      res.json({
        message: 'Smell rule updated successfully',
        rule
      });

    } catch (error) {
      console.error('Update smell rule error:', error);
      res.status(500).json({ 
        message: 'Failed to update smell rule', 
        error: error.message 
      });
    }
  };

  // Get all reports (admin view)
  getAllReports = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        language,
        userId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = {};
      
      if (status) {
        filter['summary.status'] = status;
      }
      
      if (language) {
        filter.fileLanguage = language;
      }
      
      if (userId) {
        filter.userId = userId;
      }
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reports, total] = await Promise.all([
        Report.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'username email')
          .select('-codeSmells -metrics')
          .lean(),
        Report.countDocuments(filter)
      ]);

      res.json({
        message: 'Reports retrieved successfully',
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({ 
        message: 'Failed to get reports', 
        error: error.message 
      });
    }
  };

  // Delete any report (admin)
  deleteReport = async (req, res) => {
    try {
      const { reportId } = req.params;

      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      await Report.findByIdAndDelete(reportId);

      res.json({
        message: 'Report deleted successfully'
      });

    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ 
        message: 'Failed to delete report', 
        error: error.message 
      });
    }
  };

  // Create new user (admin)
  createUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email or username already exists'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ 
        message: 'Failed to create user', 
        error: error.message 
      });
    }
  };

  // Reset user password
  resetUserPassword = async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        message: 'Failed to reset password', 
        error: error.message 
      });
    }
  };
}

module.exports = new AdminController();
