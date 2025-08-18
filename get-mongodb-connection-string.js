import fs from 'fs';
import path from 'path';

console.log('🔧 Get MongoDB Atlas Connection String');
console.log('======================================');

const envPath = path.join(process.cwd(), '.env');

const showInstructions = () => {
  console.log('\n📋 How to Get Your MongoDB Atlas Connection String:');
  console.log('===================================================');
  
  console.log('\n1️⃣ Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com');
  
  console.log('\n2️⃣ Navigate to Your Database:');
  console.log('   - Click "Database" in the left sidebar');
  console.log('   - Click "Connect" on your cluster');
  
  console.log('\n3️⃣ Choose Connection Method:');
  console.log('   - Click "Connect your application"');
  console.log('   - Select "Node.js" as your driver');
  console.log('   - Copy the connection string');
  
  console.log('\n4️⃣ Update the Connection String:');
  console.log('   - Replace <username> with your actual username');
  console.log('   - Replace <password> with your actual password');
  console.log('   - Replace <dbname> with "TELUGU"');
  
  console.log('\n5️⃣ Example Connection String:');
  console.log('   mongodb+srv://your_username:your_password@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority');
  
  console.log('\n6️⃣ Create Database User (if needed):');
  console.log('   - Go to "Database Access"');
  console.log('   - Click "Add New Database User"');
  console.log('   - Username: telugu_user');
  console.log('   - Password: telugu123');
  console.log('   - Privileges: "Read and write to any database"');
  
  console.log('\n7️⃣ Update Network Access:');
  console.log('   - Go to "Network Access"');
  console.log('   - Click "Add IP Address"');
  console.log('   - Click "Allow Access from Anywhere"');
};

const updateEnvFile = (connectionString) => {
  try {
    // Read current .env file
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    // Update MONGODB_URI line
    const updatedLines = lines.map(line => {
      if (line.startsWith('MONGODB_URI=')) {
        return `MONGODB_URI=${connectionString}`;
      }
      return line;
    });
    
    // Write back to file
    fs.writeFileSync(envPath, updatedLines.join('\n'));
    console.log('✅ .env file updated with new connection string');
    return true;
  } catch (error) {
    console.log('❌ Error updating .env file:', error.message);
    return false;
  }
};

const showCurrentStatus = () => {
  console.log('\n📋 Current .env File:');
  console.log('=====================');
  
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('MONGODB_URI=')) {
        console.log(`   ${line}`);
      }
    });
  } catch (error) {
    console.log('❌ Error reading .env file');
  }
};

const main = () => {
  console.log('\n🔧 Current Status:');
  console.log('==================');
  console.log('❌ MongoDB Atlas connection is failing');
  console.log('💡 You need to get the correct connection string from MongoDB Atlas');
  console.log('🎯 Follow the instructions below to fix this');
  
  showCurrentStatus();
  showInstructions();
  
  console.log('\n🔧 Quick Fix Options:');
  console.log('=====================');
  
  console.log('\nOption 1: Get Connection String from MongoDB Atlas');
  console.log('   - Follow the instructions above');
  console.log('   - Copy the connection string from your dashboard');
  console.log('   - Update your .env file');
  
  console.log('\nOption 2: Create New Database User');
  console.log('   - Username: telugu_user');
  console.log('   - Password: telugu123');
  console.log('   - Update connection string');
  
  console.log('\nOption 3: Use Local MongoDB');
  console.log('   - Install MongoDB Community Server');
  console.log('   - Use: mongodb://localhost:27017/telugu-learning');
  
  console.log('\n🎯 Recommended Action:');
  console.log('   Follow Option 1 to get the correct connection string from MongoDB Atlas');
  console.log('   Then run: node test-mongodb-connection.js');
  
  console.log('\n💡 Need Help?');
  console.log('   - Make sure you have access to your MongoDB Atlas account');
  console.log('   - Check that your cluster is running');
  console.log('   - Verify your database user has correct permissions');
};

main();
