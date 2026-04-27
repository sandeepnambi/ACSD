const CodeAnalyzer = require('../src/services/codeAnalyzer');
const SmellDetector = require('../src/services/smellDetector');
const path = require('path');

async function test() {
  const analyzer = new CodeAnalyzer();
  const detector = new SmellDetector();
  
  setTimeout(async () => {
    const filePath = path.join(__dirname, '../../minor-smells.py');
    console.log(`Analyzing file: ${filePath}`);
    
    try {
      const analysisResults = await analyzer.analyzeFile(filePath, 'python');
      const codeSmells = await detector.detectSmells(analysisResults, 'python');
      console.log(`Total Smells Detected: ${codeSmells.length}`);
      process.exit(0);
    } catch (error) {
      console.error('Test failed with error:', error);
      process.exit(1);
    }
  }, 1000);
}

test();
