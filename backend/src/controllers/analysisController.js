const CodeAnalyzer = require('../services/codeAnalyzer');
const SmellDetector = require('../services/smellDetector');
const Report = require('../models/Report');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AnalysisController {
  constructor() {
    this.analyzer = new CodeAnalyzer();
    this.detector = new SmellDetector();
  }

  // Helper to aggregate metrics (take max value for each metric type)
  _aggregateMetrics(metrics) {
    if (!metrics || metrics.length === 0) return [];
    
    const aggregated = {};
    metrics.forEach(metric => {
      if (!aggregated[metric.name] || metric.value > aggregated[metric.name].value) {
        aggregated[metric.name] = {
          name: metric.name,
          value: metric.value,
          threshold: metric.threshold
        };
      }
    });
    
    return Object.values(aggregated);
  }

  // Upload file for analysis
  uploadFile = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.file;
      const extension = path.extname(file.originalname).toLowerCase();
      
      const languageMap = {
        '.py': 'python',
        '.java': 'java',
        '.cpp': 'cpp',
        '.hpp': 'cpp'
      };

      const language = languageMap[extension] || 'other';

      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          path: file.path,
          language: language
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  };

  // Analyze uploaded code
  analyzeCode = async (req, res) => {
    try {
      const { fileId, fileName, language } = req.body;
      const userId = req.user._id;

      if (!fileId || !fileName || !language) {
        return res.status(400).json({ 
          message: 'Missing required fields: fileId, fileName, language' 
        });
      }

      // Read the uploaded file
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', fileId);
      const code = await fs.readFile(filePath, 'utf8');

      // Perform analysis
      const analysisResults = await this.analyzer.analyzeFile(filePath, language);
      
      // Detect code smells
      const codeSmells = await this.detector.detectSmells(analysisResults, language);

      // Create report
      const report = new Report({
        fileId: uuidv4(),
        fileName: fileName,
        filePath: filePath,
        fileLanguage: language,
        fileSize: code.length,
        codeContent: code, // Save original code
        userId: userId,
        codeSmells: codeSmells,
        metrics: this._aggregateMetrics(analysisResults.metrics),
        analysisDuration: analysisResults.analysisDuration || 0
      });

      await report.save();

      res.json({
        message: 'Analysis completed successfully',
        results: {
          reportId: report._id,
          metrics: report.metrics,
          codeSmells: codeSmells,
          summary: report.summary,
          analysisDuration: analysisResults.analysisDuration || 0
        }
      });

      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError.message);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        message: 'Analysis failed', 
        error: error.message 
      });
    }
  };

  // Get analysis status (for long-running analyses)
  getAnalysisStatus = async (req, res) => {
    try {
      const { analysisId } = req.params;
      
      // For now, return a simple status
      // In a real implementation, you might use a job queue like Redis
      const report = await Report.findOne({ fileId: analysisId });
      
      if (!report) {
        return res.status(404).json({ message: 'Analysis not found' });
      }

      res.json({
        analysisId: analysisId,
        status: 'completed',
        progress: 100,
        reportId: report._id
      });

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        message: 'Failed to get analysis status', 
        error: error.message 
      });
    }
  };

  // Get supported languages
  getSupportedLanguages = async (req, res) => {
    try {
      res.json({
        languages: [
          { name: 'python', extension: '.py', displayName: 'Python' },
          { name: 'java', extension: '.java', displayName: 'Java' },
          { name: 'cpp', extension: '.cpp', displayName: 'C++' }
        ]
      });
    } catch (error) {
      console.error('Languages error:', error);
      res.status(500).json({ 
        message: 'Failed to get supported languages', 
        error: error.message 
      });
    }
  };

  // Get analysis statistics
  getAnalysisStats = async (req, res) => {
    try {
      const userId = req.user._id;
      
      const stats = await Report.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalAnalyses: { $sum: 1 },
            totalSmells: { $sum: '$summary.totalSmells' },
            averageQualityScore: { $avg: '$summary.qualityScore' },
            criticalIssues: { $sum: '$summary.criticalSmells' }
          }
        }
      ]);

      const result = stats[0] || {
        totalAnalyses: 0,
        totalSmells: 0,
        averageQualityScore: 100,
        criticalIssues: 0
      };

      res.json({
        message: 'Analysis statistics retrieved successfully',
        stats: result
      });

    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get analysis statistics', 
        error: error.message 
      });
    }
  };
}

module.exports = new AnalysisController();
