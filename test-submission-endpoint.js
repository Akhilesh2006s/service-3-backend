// Test submission endpoint
const testSubmissionEndpoint = async () => {
  try {
    console.log('Testing submission endpoint...');

    const testData = {
      examId: 'test-exam',
      submissionType: 'mcq',
      score: 100,
      totalQuestions: 3,
      correctAnswers: 3,
      timeSpent: 30,
      answers: {
        'q_0': 0,
        'q_1': 1,
        'q_2': 2
      }
    };

    console.log('Sending data:', testData);

    // Use a valid user ID from users.json
    const validToken = 'Bearer test-token-1754484858934-learner';

    const response = await fetch('https://service-3-backend-production.up.railway.app/api/submissions', {
      method: 'POST',
      headers: {
        'Authorization': validToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.json();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Endpoint test successful');
    } else {
      console.log('❌ Endpoint test failed');
      console.log('Error details:', result);
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
    console.error('Error stack:', error.stack);
  }
};

// Test authentication first
const testAuth = async () => {
  try {
    console.log('Testing authentication...');
    
    // Use a valid user ID from users.json
    const validToken = 'Bearer test-token-1754484858934-learner';
    
    const response = await fetch('https://service-3-backend-production.up.railway.app/api/auth/me', {
      headers: {
        'Authorization': validToken
      }
    });

    console.log('Auth response status:', response.status);
    const result = await response.json();
    console.log('Auth response:', result);

  } catch (error) {
    console.error('Auth test error:', error);
  }
};

// Run the tests
(async () => {
  await testAuth();
  console.log('\n---\n');
  await testSubmissionEndpoint();
})();
