import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Google Cloud Vision API OCR endpoint
router.post('/analyze-handwriting', async (req, res) => {
  try {
    const { imageData, correctWord } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Cloud Vision API key not configured'
      });
    }

    // Remove data:image/png;base64, prefix if present
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    // Call Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1
                }
              ],
              imageContext: {
                languageHints: ['te'] // Telugu language hint
              }
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Vision API error:', response.status, errorData);
      return res.status(500).json({
        success: false,
        message: `Google Vision API error: ${response.status}`,
        error: errorData
      });
    }

    const data = await response.json();
    console.log('Google Vision API Response:', data);

    // Extract text from response
    let recognizedText = '';
    let confidence = 0;

    if (data.responses && data.responses[0] && data.responses[0].fullTextAnnotation) {
      recognizedText = data.responses[0].fullTextAnnotation.text || '';
      confidence = data.responses[0].fullTextAnnotation.pages?.[0]?.confidence || 0;
    }

    // Clean up the recognized text
    recognizedText = recognizedText.trim().replace(/\s+/g, '');
    const isCorrect = correctWord ? recognizedText === correctWord : false;

    res.json({
      success: true,
      data: {
        isCorrect,
        detectedWord: recognizedText || 'No text detected',
        confidence: confidence || 0.1,
        method: 'Premium OCR (Google Vision)',
        analysis: {
          pixelCount: 0,
          expectedRange: [0, 0],
          wordLength: correctWord ? correctWord.length : 0,
          detectedLength: recognizedText.length,
          apiConfidence: Math.round(confidence * 100),
          originalAPIText: data.responses?.[0]?.fullTextAnnotation?.text || ''
        }
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process OCR request',
      error: error.message
    });
  }
});

export default router;
