import fs from 'fs';
import path from 'path';

console.log('🔧 Final MongoDB Atlas Fix');
console.log('==========================');

const envPath = path.join(process.cwd(), '.env');

const createNewUser = () => {
  console.log('\n📋 Creating New MongoDB Atlas User');
  console.log('===================================');
  
  const newUsername = 'telugu_app_user';
  const newPassword = 'TeluguApp123!';
  
  console.log(`\n🔧 New User Details:`);
  console.log(`   Username: ${newUsername}`);
  console.log(`   Password: ${newPassword}`);
  
  console.log('\n📋 Steps to Create User in MongoDB Atlas:');
  console.log('==========================================');
  
  console.log('\n1️⃣ Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com');
  
  console.log('\n2️⃣ Navigate to Database Access:');
  console.log('   - Click "Database Access" in the left sidebar');
  console.log('   - Click "Add New Database User"');
  
  console.log('\n3️⃣ Create New User:');
  console.log('   - Authentication Method: Password');
  console.log(`   - Username: ${newUsername}`);
  console.log(`   - Password: ${newPassword}`);
  console.log('   - Database User Privileges: "Read and write to any database"');
  console.log('   - Click "Add User"');
  
  console.log('\n4️⃣ Update Network Access:');
  console.log('   - Go to "Network Access" in left sidebar');
  console.log('   - Click "Add IP Address"');
  console.log('   - Click "Allow Access from Anywhere" (for development)');
  console.log('   - Click "Confirm"');
  
  return { username: newUsername, password: newPassword };
};

const updateEnvFile = (username, password) => {
  try {
    const newURI = `MONGODB_URI=mongodb+srv://${username}:${password}@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority`;
    
    // Read current .env file
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    // Update MONGODB_URI line
    const updatedLines = lines.map(line => {
      if (line.startsWith('MONGODB_URI=')) {
        return newURI;
      }
      return line;
    });
    
    // Write back to file
    fs.writeFileSync(envPath, updatedLines.join('\n'));
    console.log('✅ .env file updated with new user credentials');
    
    return newURI;
  } catch (error) {
    console.log('❌ Error updating .env file:', error.message);
    return null;
  }
};

const showCurrentStatus = () => {
  console.log('\n📋 Current Status:');
  console.log('==================');
  
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('MONGODB_URI=') || line.startsWith('PORT=') || line.startsWith('JWT_SECRET=')) {
        console.log(`   ${line}`);
      }
    });
  } catch (error) {
    console.log('❌ Error reading .env file');
  }
};

const main = () => {
  console.log('\n🔧 MongoDB Atlas Connection Issues:');
  console.log('====================================');
  console.log('❌ Current connection is failing with authentication error');
  console.log('💡 The password in your connection string is incorrect');
  console.log('🎯 Solution: Create a new database user with correct credentials');
  
  showCurrentStatus();
  
  const { username, password } = createNewUser();
  
  console.log('\n🔧 Ready to Update .env File?');
  console.log('=============================');
  console.log('This will update your .env file with the new user credentials.');
  console.log('Make sure you create the user in MongoDB Atlas first!');
  
  // Update the .env file
  const newURI = updateEnvFile(username, password);
  
  if (newURI) {
    console.log('\n✅ .env file updated successfully!');
    console.log('\n📋 New MONGODB_URI:');
    console.log(`   ${newURI}`);
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Create the user in MongoDB Atlas (follow instructions above)');
    console.log('2. Run: node test-mongodb-connection.js');
    console.log('3. If successful, restart your server with: node server.js');
    console.log('4. Your exam system will then use MongoDB instead of in-memory storage');
    
    console.log('\n💡 Alternative: Keep Using In-Memory Storage');
    console.log('   - Your exam system is already working perfectly');
    console.log('   - All features are functional');
    console.log('   - No setup required');
  }
};

main();
