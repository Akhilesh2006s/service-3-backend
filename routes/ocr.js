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
    
    console.log('Image data length:', base64Data.length);
    console.log('Image data preview:', base64Data.substring(0, 50) + '...');
    console.log('Correct word:', correctWord);

    // Call Google Cloud Vision API with both TEXT_DETECTION and DOCUMENT_TEXT_DETECTION
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
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                },
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1
                }
              ],
              imageContext: {
                languageHints: ['te', 'en'], // Telugu and English language hints
                textDetectionParams: {
                  enableTextDetectionConfidenceScore: true
                }
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
    console.log('Google Vision API Response:', JSON.stringify(data, null, 2));

    // Extract text from response - try both TEXT_DETECTION and DOCUMENT_TEXT_DETECTION
    let recognizedText = '';
    let confidence = 0;
    let originalText = '';

    if (data.responses && data.responses[0]) {
      const response = data.responses[0];
      
      // Try DOCUMENT_TEXT_DETECTION first (better for handwriting)
      if (response.fullTextAnnotation && response.fullTextAnnotation.text) {
        recognizedText = response.fullTextAnnotation.text;
        confidence = response.fullTextAnnotation.pages?.[0]?.confidence || 0;
        originalText = response.fullTextAnnotation.text;
        console.log('Using DOCUMENT_TEXT_DETECTION result:', recognizedText);
      }
      // Fallback to TEXT_DETECTION
      else if (response.textAnnotations && response.textAnnotations.length > 0) {
        recognizedText = response.textAnnotations[0].description || '';
        confidence = 0.8; // Default confidence for text detection
        originalText = response.textAnnotations[0].description || '';
        console.log('Using TEXT_DETECTION result:', recognizedText);
      }
    }

    // Clean up the recognized text
    recognizedText = recognizedText.trim().replace(/\s+/g, '');
    const isCorrect = correctWord ? recognizedText === correctWord : false;
    
    console.log('Final recognized text:', recognizedText);
    console.log('Confidence:', confidence);

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
          originalAPIText: originalText || ''
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
