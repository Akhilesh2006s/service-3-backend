import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

// Test CSV parsing with the varnamala file
const testCSVParsing = async () => {
  try {
    const csvPath = path.join(process.cwd(), '../telugu-bhasha-gyan-main/sample-csv-files/varnamala-50-words.csv');
    console.log('Testing CSV file at:', csvPath);
    
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        console.log('Parsed row:', data);
        results.push(data);
      })
      .on('end', () => {
        console.log('Total rows parsed:', results.length);
        console.log('First 3 rows:', results.slice(0, 3));
        
        // Test validation
        const errors = [];
        results.forEach((row, index) => {
          if (!row.telugu_word || !row.english_meaning || !row.difficulty) {
            console.log(`Row ${index + 1} missing fields:`, {
              telugu_word: row.telugu_word,
              english_meaning: row.english_meaning,
              difficulty: row.difficulty
            });
            errors.push(`Row ${index + 1}: Missing required fields`);
          }
        });
        
        console.log('Validation errors:', errors);
        console.log('Validation passed:', errors.length === 0);
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
      });
      
  } catch (error) {
    console.error('Test error:', error);
  }
};

testCSVParsing();
