const mongoose = require('mongoose');
require('dotenv').config();

async function recalculateScores() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Fetching all reports...');
    const reports = await mongoose.connection.db.collection('reports').find({}).toArray();
    console.log(`Found ${reports.length} reports to update.`);
    
    for (const report of reports) {
      console.log(`Recalculating score for: ${report.fileName} (${report._id})`);
      
      const codeSmells = report.codeSmells || [];
      const totalSmells = codeSmells.length;
      const criticalSmells = codeSmells.filter(smell => smell.severity === 'high').length;
      
      let penalty = 0;
      codeSmells.forEach(smell => {
        if (smell.severity === 'high') penalty += 7;
        else if (smell.severity === 'medium') penalty += 3;
        else penalty += 1;
      });
      
      const qualityScore = Math.max(0, 100 - penalty);
      
      let status = 'clean';
      if (totalSmells === 0) {
        status = 'clean';
      } else if (criticalSmells > 0 || totalSmells > 5 || qualityScore < 70) {
        status = 'needs_refactoring';
      } else {
        status = 'minor_issues';
      }
      
      await mongoose.connection.db.collection('reports').updateOne(
        { _id: report._id },
        { 
          $set: { 
            'summary.totalSmells': totalSmells,
            'summary.criticalSmells': criticalSmells,
            'summary.qualityScore': qualityScore,
            'summary.status': status
          } 
        }
      );
    }
    
    console.log('All report scores updated successfully!');
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recalculateScores();
