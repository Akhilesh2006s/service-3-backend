import fetch from 'node-fetch';

const testDescriptiveAPI = async () => {
  try {
    console.log('🧪 Testing Descriptive Exam API...\n');
    
    // Test the exams endpoint
    const response = await fetch('https://backend-production-e051.up.railway.app/api/exams/student', {
      headers: {
        'Authorization': 'Bearer test-token-1-learner',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      // Find descriptive exam
      const descriptiveExam = data.data.find(exam => exam.type === 'descriptive');
      
      if (descriptiveExam) {
        console.log('\n📝 Descriptive Exam Found:');
        console.log(`Title: ${descriptiveExam.title}`);
        console.log(`Type: ${descriptiveExam.type}`);
        console.log(`Descriptive Questions Count: ${descriptiveExam.descriptiveQuestions ? descriptiveExam.descriptiveQuestions.length : 0}`);
        
        if (descriptiveExam.descriptiveQuestions && descriptiveExam.descriptiveQuestions.length > 0) {
          console.log('\n📋 Questions:');
          descriptiveExam.descriptiveQuestions.forEach((q, index) => {
            console.log(`Question ${index + 1}: ${q.question}`);
          });
        } else {
          console.log('\n❌ No descriptive questions in API response!');
        }
      } else {
        console.log('\n❌ No descriptive exam found in API response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Wait for server to start
setTimeout(testDescriptiveAPI, 3000);



