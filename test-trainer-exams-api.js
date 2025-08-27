import fetch from 'node-fetch';

const testTrainerExamsAPI = async () => {
  console.log('🧪 Testing Trainer Exams API...\n');
  
  // Trainer token
  const trainerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4MzNlZWRlMTA3YzBhNmFjYWUyYzYiLCJyb2xlIjoidHJhaW5lciIsImlhdCI6MTc1NDgyNjUyMSwiZXhwIjoxNzU1NDMxMzIxfQ.GWwr05kTHakAc4OIWCA4G6prDRiRS_RocjybLvgY8jI';
  
  try {
    // Test the trainer exams endpoint
    console.log('Testing /api/exams/trainer endpoint...');
    const response = await fetch('https://service-3-backend-production.up.railway.app/api/exams/trainer', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${trainerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Trainer exams endpoint working correctly!');
      try {
        const data = JSON.parse(responseText);
        console.log('Number of exams returned:', data.data ? data.data.length : 0);
        
        if (data.data) {
          data.data.forEach((exam, index) => {
            console.log(`\nExam ${index + 1}:`);
            console.log(`  Title: ${exam.title}`);
            console.log(`  Type: ${exam.type}`);
            console.log(`  Published: ${exam.isPublished}`);
            console.log(`  MCQ Questions: ${exam.mcqQuestions ? exam.mcqQuestions.length : 0}`);
            console.log(`  Descriptive Questions: ${exam.descriptiveQuestions ? exam.descriptiveQuestions.length : 0}`);
            console.log(`  Voice Questions: ${exam.voiceQuestions ? exam.voiceQuestions.length : 0}`);
            
            // Calculate total questions
            const totalQuestions = (exam.mcqQuestions ? exam.mcqQuestions.length : 0) + 
                                 (exam.descriptiveQuestions ? exam.descriptiveQuestions.length : 0) + 
                                 (exam.voiceQuestions ? exam.voiceQuestions.length : 0);
            console.log(`  Total Questions: ${totalQuestions}`);
          });
        }
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else {
      console.log('❌ Trainer exams endpoint failed');
    }
    
  } catch (error) {
    console.error('Error testing trainer exams endpoint:', error);
  }
};

// Start the test
testTrainerExamsAPI();
