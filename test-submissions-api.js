import fetch from 'node-fetch';

async function testSubmissionsAPI() {
  try {
    console.log('🧪 Testing submissions API...');
    
    // First, let's get a token (you'll need to replace this with a valid token)
    const token = 'your-token-here'; // Replace with actual token
    
    const response = await fetch('https://service-3-backend-production.up.railway.app/api/submissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Response data:', JSON.stringify(data, null, 2));
      
      if (data.data) {
        console.log(`📋 Total submissions returned: ${data.data.length}`);
        
        // Group by submission type
        const byType = {};
        data.data.forEach(sub => {
          const type = sub.submissionType || 'unknown';
          byType[type] = (byType[type] || 0) + 1;
        });
        
        console.log('📊 Submissions by type:', byType);
        
        // Show first few submissions
        console.log('\n📋 First 5 submissions:');
        data.data.slice(0, 5).forEach((sub, index) => {
          console.log(`${index + 1}. ${sub.student?.name || 'Unknown'} - ${sub.submissionType} - ${sub.submittedAt}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testSubmissionsAPI();
