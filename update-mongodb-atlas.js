import fs from 'fs';
import path from 'path';

console.log('🔧 MongoDB Atlas Credential Update Helper');
console.log('==========================================');

// Read current .env file
const envPath = path.join(process.cwd(), '.env');

const readEnvFile = () => {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found .env file');
      return content;
    } else {
      console.log('❌ .env file not found');
      return null;
    }
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    return null;
  }
};

const updateEnvFile = (newMongoDBURI) => {
  try {
    let content = readEnvFile();
    if (!content) {
      console.log('Creating new .env file...');
      content = `# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=1ec1af88f3417fb4e39c461453f956bc
MONGODB_URI=${newMongoDBURI}
FRONTEND_URL=http://192.168.1.7:5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://192.168.1.7:8080,http://192.168.1.7:3000,http://192.168.1.7:5173`;
    } else {
      // Update existing MONGODB_URI
      const lines = content.split('\n');
      const updatedLines = lines.map(line => {
        if (line.startsWith('MONGODB_URI=')) {
          return `MONGODB_URI=${newMongoDBURI}`;
        }
        return line;
      });
      content = updatedLines.join('\n');
    }

    fs.writeFileSync(envPath, content);
    console.log('✅ .env file updated successfully');
    return true;
  } catch (error) {
    console.log('❌ Error updating .env file:', error.message);
    return false;
  }
};

const showInstructions = () => {
  console.log('\n📋 Instructions to Fix MongoDB Atlas:');
  console.log('=====================================');
  
  console.log('\n1️⃣ Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com');
  
  console.log('\n2️⃣ Navigate to Database Access:');
  console.log('   - Click "Database Access" in the left sidebar');
  console.log('   - Find your user: akhileshsamayamanthula');
  
  console.log('\n3️⃣ Update Password:');
  console.log('   - Click "Edit" on your user');
  console.log('   - Click "Edit Password"');
  console.log('   - Set a new password (e.g., "Telugu123!")');
  console.log('   - Click "Update User"');
  
  console.log('\n4️⃣ Get Connection String:');
  console.log('   - Go to "Database" in left sidebar');
  console.log('   - Click "Connect"');
  console.log('   - Choose "Connect your application"');
  console.log('   - Copy the connection string');
  
  console.log('\n5️⃣ Update Your .env File:');
  console.log('   - Replace the password in the connection string');
  console.log('   - Example: mongodb+srv://akhileshsamayamanthula:Telugu123!@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHaa?retryWrites=true&w=true');
  
  console.log('\n6️⃣ Test Connection:');
  console.log('   - Run: node test-mongodb-connection.js');
  
  console.log('\n💡 Alternative: Create New User');
  console.log('   - Click "Add New Database User"');
  console.log('   - Username: telugu_user');
  console.log('   - Password: telugu123');
  console.log('   - Role: "Read and write to any database"');
  console.log('   - Click "Add User"');
};

const main = () => {
  console.log('\n📋 Current .env file content:');
  const content = readEnvFile();
  if (content) {
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('MONGODB_URI') || line.includes('JWT_SECRET')) {
        console.log(`   ${line}`);
      }
    });
  }
  
  showInstructions();
  
  console.log('\n🔧 Quick Fix Options:');
  console.log('=====================');
  
  console.log('\nOption 1: Update Password in MongoDB Atlas');
  console.log('   - Follow the instructions above');
  console.log('   - Update your .env file manually');
  
  console.log('\nOption 2: Create New Database User');
  console.log('   - Create user: telugu_user');
  console.log('   - Password: telugu123');
  console.log('   - Update connection string');
  
  console.log('\nOption 3: Use Local MongoDB');
  console.log('   - Install MongoDB Community Server');
  console.log('   - Use: mongodb://localhost:27017/telugu-learning');
  
  console.log('\n🎯 Recommended Action:');
  console.log('   Follow Option 1 or 2 to fix MongoDB Atlas');
  console.log('   Then run: node test-mongodb-connection.js');
};

main();
