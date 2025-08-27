import fs from 'fs';
import path from 'path';

console.log('🔧 Updating MongoDB Atlas Password in .env file');
console.log('===============================================');

const envPath = path.join(process.cwd(), '.env');

// Read current .env file
const readEnvFile = () => {
  try {
    if (fs.existsSync(envPath)) {
      return fs.readFileSync(envPath, 'utf8');
    }
    return null;
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    return null;
  }
};

// Update the password in the connection string
const updatePassword = (content, newPassword) => {
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith('MONGODB_URI=')) {
      // Replace the password in the connection string
      const updatedLine = line.replace(
        /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
        `mongodb+srv://$1:${newPassword}@`
      );
      console.log('✅ Updated MONGODB_URI with new password');
      return updatedLine;
    }
    return line;
  });
  return updatedLines.join('\n');
};

// Write updated content back to .env file
const writeEnvFile = (content) => {
  try {
    fs.writeFileSync(envPath, content);
    console.log('✅ .env file updated successfully');
    return true;
  } catch (error) {
    console.log('❌ Error writing .env file:', error.message);
    return false;
  }
};

// Main function
const main = () => {
  console.log('\n📋 Current .env file:');
  const content = readEnvFile();
  if (!content) {
    console.log('❌ .env file not found');
    return;
  }

  // Show current MONGODB_URI
  const lines = content.split('\n');
  const mongoLine = lines.find(line => line.startsWith('MONGODB_URI='));
  if (mongoLine) {
    console.log(`   ${mongoLine}`);
  }

  console.log('\n🔧 Enter new password for MongoDB Atlas:');
  console.log('   (Press Enter to use default: Telugu123!)');
  
  // For now, use a default password
  const newPassword = 'Telugu123!';
  console.log(`   Using password: ${newPassword}`);

  // Update the content
  const updatedContent = updatePassword(content, newPassword);
  
  // Write back to file
  if (writeEnvFile(updatedContent)) {
    console.log('\n✅ Password updated successfully!');
    console.log('\n📋 Updated MONGODB_URI:');
    const updatedLines = updatedContent.split('\n');
    const updatedMongoLine = updatedLines.find(line => line.startsWith('MONGODB_URI='));
    if (updatedMongoLine) {
      console.log(`   ${updatedMongoLine}`);
    }
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Update the password in MongoDB Atlas dashboard');
    console.log('2. Run: node test-mongodb-connection.js');
    console.log('3. If successful, restart your server');
  }
};

main();
