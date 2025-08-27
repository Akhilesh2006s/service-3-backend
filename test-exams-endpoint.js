import fetch from 'node-fetch';

const testExamsEndpoint = async () => {
  console.log('Testing exams endpoint directly...\n');
  
  // The MongoDB user token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4N2ZiOTViZjY2ZjZlMDk3YzFjMGIiLCJyb2xlIjoibGVhcm5lciIsImlhdCI6MTc1NDgyNDYzMywiZXhwIjoxNzU1NDI5NDMzfQ.yFxxKHldqCHctvlnTu4etclYjA3lbtr37p_165J8JGE';
  
  try {
    // Test the exams endpoint
    console.log('Testing /api/exams/student endpoint...');
    const response = await fetch('https://service-3-backend-production.up.railway.app/api/exams/student', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Exams endpoint working correctly!');
      try {
        const data = JSON.parse(responseText);
        console.log('Number of exams returned:', data.data ? data.data.length : 0);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else {
      console.log('❌ Exams endpoint failed');
    }
    
  } catch (error) {
    console.error('Error testing exams endpoint:', error);
  }
};

// Start the test
testExamsEndpoint();
