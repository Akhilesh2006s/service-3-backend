import fetch from 'node-fetch';

const testEvaluationAPI = async () => {
  try {
    console.log('🧪 Testing Evaluation API...');
    
    // First, let's get a list of submissions
    const submissionsResponse = await fetch('https://backend-production-e051.up.railway.app/api/submissions', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📋 Submissions response status:', submissionsResponse.status);
    
    if (submissionsResponse.ok) {
      const submissions = await submissionsResponse.json();
      console.log('📋 Submissions found:', submissions.data?.length || 0);
      
      if (submissions.data && submissions.data.length > 0) {
        const firstSubmission = submissions.data[0];
        console.log('📋 First submission:', {
          id: firstSubmission._id,
          type: firstSubmission.submissionType,
          status: firstSubmission.status,
          studentName: firstSubmission.studentName
        });
        
        // Test evaluation API
        const evaluationResponse = await fetch(`https://backend-production-e051.up.railway.app/api/submissions/${firstSubmission._id}/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            overallScore: 85,
            feedback: 'Test evaluation',
            status: 'evaluated'
          })
        });
        
        console.log('📝 Evaluation response status:', evaluationResponse.status);
        
        if (evaluationResponse.ok) {
          const result = await evaluationResponse.json();
          console.log('✅ Evaluation successful:', result);
        } else {
          const error = await evaluationResponse.text();
          console.log('❌ Evaluation failed:', error);
        }
      }
    } else {
      console.log('❌ Failed to get submissions');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEvaluationAPI();


