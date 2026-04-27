const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');
const { validateReportQuery } = require('../middleware/validation');

// Get all reports for a user
router.get('/', authenticate, validateReportQuery, reportsController.getReports);

// Get specific report
router.get('/:reportId', authenticate, reportsController.getReport);

// Delete report
router.delete('/:reportId', authenticate, reportsController.deleteReport);

// Export report
router.get('/:reportId/export', authenticate, reportsController.exportReport);

// Get report statistics
router.get('/stats/overview', authenticate, reportsController.getReportStats);

// Get smell type distribution
router.get('/stats/distribution', authenticate, reportsController.getSmellDistribution);

module.exports = router;
