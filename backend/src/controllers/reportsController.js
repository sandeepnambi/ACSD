const Report = require('../models/Report');
const fs = require('fs').promises;

class ReportsController {
  // Get all reports for a user
  getReports = async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        page = 1,
        limit = 10,
        status,
        language,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = { userId };
      
      if (status) {
        filter['summary.status'] = status;
      }
      
      if (language) {
        filter.fileLanguage = language;
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
          .select('-codeSmells -metrics') // Exclude large fields for list view
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
      console.error('Get reports error:', error);
      res.status(500).json({ 
        message: 'Failed to get reports', 
        error: error.message 
      });
    }
  };

  // Get specific report
  getReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user._id;

      const report = await Report.findOne({ 
        _id: reportId, 
        userId: userId 
      });

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({
        message: 'Report retrieved successfully',
        report
      });

    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({ 
        message: 'Failed to get report', 
        error: error.message 
      });
    }
  };

  // Delete report
  deleteReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user._id;

      const report = await Report.findOne({ 
        _id: reportId, 
        userId: userId 
      });

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

  // Export report
  exportReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { format = 'json' } = req.query;
      const userId = req.user._id;

      const report = await Report.findOne({ 
        _id: reportId, 
        userId: userId 
      });

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.json"`);
        res.json(report);
      } else if (format === 'pdf') {
        // For PDF export, you would typically use a library like puppeteer
        // For now, return a placeholder
        res.status(400).json({ message: 'PDF export not implemented yet' });
      } else {
        res.status(400).json({ message: 'Unsupported export format' });
      }

    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({ 
        message: 'Failed to export report', 
        error: error.message 
      });
    }
  };

  // Get report statistics
  getReportStats = async (req, res) => {
    try {
      const userId = req.user._id;

      const stats = await Report.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            totalSmells: { $sum: '$summary.totalSmells' },
            criticalSmells: { $sum: '$summary.criticalSmells' },
            averageQualityScore: { $avg: '$summary.qualityScore' },
            cleanReports: {
              $sum: { $cond: [{ $eq: ['$summary.status', 'clean'] }, 1, 0] }
            },
            needsRefactoring: {
              $sum: { $cond: [{ $eq: ['$summary.status', 'needs_refactoring'] }, 1, 0] }
            },
            minorIssues: {
              $sum: { $cond: [{ $eq: ['$summary.status', 'minor_issues'] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalReports: 0,
        totalSmells: 0,
        criticalSmells: 0,
        averageQualityScore: 100,
        cleanReports: 0,
        needsRefactoring: 0,
        minorIssues: 0
      };

      // Get recent activity
      const recentReports = await Report.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fileName createdAt summary.status summary.qualityScore')
        .lean();

      res.json({
        message: 'Report statistics retrieved successfully',
        stats: result,
        recentActivity: recentReports
      });

    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get report statistics', 
        error: error.message 
      });
    }
  };

  // Get smell type distribution
  getSmellDistribution = async (req, res) => {
    try {
      const userId = req.user._id;

      const distribution = await Report.aggregate([
        { $match: { userId: userId } },
        { $unwind: '$codeSmells' },
        {
          $group: {
            _id: '$codeSmells.type',
            count: { $sum: 1 },
            severity: { $first: '$codeSmells.severity' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        message: 'Smell distribution retrieved successfully',
        distribution
      });

    } catch (error) {
      console.error('Get smell distribution error:', error);
      res.status(500).json({ 
        message: 'Failed to get smell distribution', 
        error: error.message 
      });
    }
  };
}

module.exports = new ReportsController();
