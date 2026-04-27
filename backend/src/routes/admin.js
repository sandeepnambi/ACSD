const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateSmellRule, validateRegistration } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin dashboard stats
router.get('/stats', adminController.getSystemStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', validateRegistration, adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/users/:userId/reset-password', adminController.resetUserPassword);

// Smell rules management
router.get('/smell-rules', adminController.getSmellRules);
router.put('/smell-rules/:ruleId', validateSmellRule, adminController.updateSmellRule);

// Report management (admin view)
router.get('/reports', adminController.getAllReports);
router.delete('/reports/:reportId', adminController.deleteReport);

module.exports = router;
