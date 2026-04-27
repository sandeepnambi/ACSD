const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const analysisController = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');
const { validateFileUpload } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.py', '.java', '.cpp', '.hpp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .py, .java, and .cpp files are allowed'));
    }
  }
});

// Upload file for analysis
router.post('/upload', authenticate, upload.single('file'), validateFileUpload, analysisController.uploadFile);

// Analyze code
router.post('/analyze', authenticate, analysisController.analyzeCode);

// Get analysis status
router.get('/status/:analysisId', authenticate, analysisController.getAnalysisStatus);

// Get supported languages
router.get('/languages', authenticate, analysisController.getSupportedLanguages);

// Get analysis statistics
router.get('/stats', authenticate, analysisController.getAnalysisStats);

module.exports = router;
