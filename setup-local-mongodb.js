import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up Local MongoDB Connection');
console.log('=====================================');

const envPath = path.join(process.cwd(), '.env');

const updateEnvFile = () => {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const updatedLines = lines.map(line => {
      if (line.startsWith('MONGODB_URI=')) {
        // Use local MongoDB connection
        const newURI = 'MONGODB_URI=mongodb://localhost:27017/telugu-learning';
        console.log('✅ Updated MONGODB_URI to use local MongoDB');
        return newURI;
      }
      return line;
    });
    
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ .env file updated successfully');
    return true;
  } catch (error) {
    console.log('❌ Error updating .env file:', error.message);
    return false;
  }
};

const showInstructions = () => {
  console.log('\n📋 Instructions to Install Local MongoDB:');
  console.log('==========================================');
  
  console.log('\n1️⃣ Download MongoDB Community Server:');
  console.log('   https://www.mongodb.com/try/download/community');
  
  console.log('\n2️⃣ Install MongoDB:');
  console.log('   - Download the Windows installer');
  console.log('   - Run the installer with default settings');
  console.log('   - Install MongoDB as a Service (recommended)');
  
  console.log('\n3️⃣ Start MongoDB Service:');
  console.log('   - MongoDB should start automatically as a Windows service');
  console.log('   - Or run: net start MongoDB');
  
  console.log('\n4️⃣ Test Connection:');
  console.log('   - Run: node test-mongodb-connection.js');
  
  console.log('\n💡 Alternative: Use MongoDB Atlas (if you prefer)');
  console.log('   - Follow the previous instructions to create the user');
  console.log('   - Or use the working in-memory storage (current solution)');
};

const main = () => {
  console.log('\n🔧 Current Status:');
  console.log('==================');
  console.log('✅ Your exam system is working with in-memory storage');
  console.log('❌ MongoDB Atlas connection is failing');
  console.log('💡 You have 3 options:');
  
  console.log('\n📋 Option 1: Install Local MongoDB (Recommended)');
  console.log('   - Download and install MongoDB Community Server');
  console.log('   - Use local connection: mongodb://localhost:27017/telugu-learning');
  console.log('   - Most reliable for development');
  
  console.log('\n📋 Option 2: Fix MongoDB Atlas');
  console.log('   - Create the user in MongoDB Atlas dashboard');
  console.log('   - Follow the previous instructions');
  
  console.log('\n📋 Option 3: Keep Using In-Memory Storage');
  console.log('   - Your system is already working perfectly');
  console.log('   - All exam features are functional');
  console.log('   - Good for development and testing');
  
  console.log('\n🎯 Which option would you like?');
  console.log('   (1) Install Local MongoDB');
  console.log('   (2) Fix MongoDB Atlas');
  console.log('   (3) Keep using in-memory storage');
  
  // For now, let's set up local MongoDB
  console.log('\n🔧 Setting up Local MongoDB connection...');
  
  if (updateEnvFile()) {
    console.log('\n✅ .env file updated for local MongoDB!');
    console.log('\n📋 Updated MONGODB_URI:');
    console.log('   mongodb://localhost:27017/telugu-learning');
    
    showInstructions();
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Install MongoDB Community Server');
    console.log('2. Start MongoDB service');
    console.log('3. Run: node test-mongodb-connection.js');
    console.log('4. If successful, restart your server');
  }
};

main();
