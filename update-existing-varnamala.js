import mongoose from 'mongoose';
import VarnamalaExercise from './models/VarnamalaExercise.js';
import dotenv from 'dotenv';

dotenv.config();

// Function to break Telugu word into proper conjunct consonant components
const breakTeluguWordIntoComponents = (word) => {
  const components = [];
  let i = 0;
  
  while (i < word.length) {
    const char = word[i];
    
    // Check if this is a conjunct consonant pattern
    if (i + 1 < word.length && char === '్') {
      // This is a consonant with halant (్)
      const consonant = char;
      const halant = word[i + 1];
      
      // Check if there's a vathu after halant
      if (i + 2 < word.length) {
        const nextChar = word[i + 2];
        // Check if next char is a vathu (య, ర, ల, వ, etc.)
        if (['య', 'ర', 'ల', 'వ', 'న', 'మ', 'ళ', 'ణ', 'ఞ', 'ఙ'].includes(nextChar)) {
          // This is a conjunct consonant: combine as single unit
          const conjunct = consonant + halant + nextChar;
          components.push(conjunct);
          i += 3;
          continue;
        }
      }
      
      // Just consonant + halant
      components.push(consonant);
      components.push(halant);
      i += 2;
    } else {
      // Regular character (vowel, consonant with inherent vowel, etc.)
      components.push(char);
      i++;
    }
  }
  
  return components;
};

// Function to break Telugu word into individual letters and add random letters
const processVarnamalaWord = (teluguWord) => {
  // Break Telugu word into proper conjunct consonant components
  const letters = breakTeluguWordIntoComponents(teluguWord);
  
  console.log(`🔤 Processing word "${teluguWord}" into components:`, letters);
  
  // Add some random Telugu letters for confusion
  const randomLetters = [
    'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ',
    'క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
    'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ'
  ];
  
  // Select 2-4 random letters (not already in the word)
  const availableRandomLetters = randomLetters.filter(letter => !letters.includes(letter));
  const selectedRandomLetters = availableRandomLetters
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2)));
  
  console.log(`🎲 Adding ${selectedRandomLetters.length} random letters:`, selectedRandomLetters);
  
  // Combine original letters with random letters
  const allLetters = [...letters, ...selectedRandomLetters];
  
  // Create jumbled order (original letters + random letters)
  const jumbledOrder = allLetters.map((_, index) => index).sort(() => Math.random() - 0.5);
  
  // Create correct order - find positions of original letters in the jumbled array
  const correctOrder = letters.map(letter => jumbledOrder.indexOf(allLetters.indexOf(letter)));
  
  console.log(`🔤 Final processing for "${teluguWord}":`);
  console.log(`  Original letters:`, letters);
  console.log(`  All letters (with random):`, allLetters);
  console.log(`  Jumbled order:`, jumbledOrder);
  console.log(`  Correct order indices:`, correctOrder);
  
  return {
    original: letters,
    jumbled: jumbledOrder.map(index => allLetters[index]),
    correctOrder: correctOrder,
    randomLetters: selectedRandomLetters
  };
};

async function updateAllVarnamalaExercises() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all existing Varnamala exercises
    const exercises = await VarnamalaExercise.find({});
    console.log(`📚 Found ${exercises.length} existing Varnamala exercises`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const exercise of exercises) {
      try {
        console.log(`\n🔄 Updating exercise: ${exercise.teluguWord}`);
        
        // Process the word with new logic
        const newLettersData = processVarnamalaWord(exercise.teluguWord);
        
        // Update the exercise
        await VarnamalaExercise.findByIdAndUpdate(exercise._id, {
          letters: newLettersData
        });
        
        console.log(`✅ Updated: ${exercise.teluguWord}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating ${exercise.teluguWord}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Update completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} exercises`);
    console.log(`❌ Errors: ${errorCount} exercises`);

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateAllVarnamalaExercises();

