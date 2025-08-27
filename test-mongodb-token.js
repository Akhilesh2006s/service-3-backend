import fetch from 'node-fetch';

const testMongoDBToken = async () => {
  console.log('Testing API endpoints with MongoDB user token...\n');
  
  // The token generated for the MongoDB user
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4N2ZiOTViZjY2ZjZlMDk3YzFjMGIiLCJyb2xlIjoibGVhcm5lciIsImlhdCI6MTc1NDgyNDYzMywiZXhwIjoxNzU1NDI5NDMzfQ.yFxxKHldqCHctvlnTu4etclYjA3lbtr37p_165J8JGE';
  
  console.log('Using MongoDB user token:', token.substring(0, 50) + '...');
  
  try {
    // Test the submissions endpoint
    console.log('\nTesting submissions endpoint...');
    const submissionsResponse = await fetch('https://service-3-backend-production.up.railway.app/api/submissions/student', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Submissions response status:', submissionsResponse.status);
    
    const submissionsText = await submissionsResponse.text();
    console.log('Submissions response body:', submissionsText);
    
    if (submissionsResponse.ok) {
      console.log('✅ Submissions endpoint working correctly with MongoDB user!');
    } else {
      console.log('❌ Submissions endpoint failed');
    }
    
    // Test the exams endpoint
    console.log('\nTesting exams endpoint...');
    const examsResponse = await fetch('https://service-3-backend-production.up.railway.app/api/exams/student', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Exams response status:', examsResponse.status);
    
    const examsText = await examsResponse.text();
    console.log('Exams response body:', examsText);
    
    if (examsResponse.ok) {
      console.log('✅ Exams endpoint working correctly with MongoDB user!');
    } else {
      console.log('❌ Exams endpoint failed');
    }
    
  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
};

// Start the test
testMongoDBToken();
