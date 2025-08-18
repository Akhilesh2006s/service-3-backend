import fs from 'fs';
import path from 'path';

console.log('🔧 Create New MongoDB Atlas User Helper');
console.log('=======================================');

const envPath = path.join(process.cwd(), '.env');

const updateEnvFile = (newUsername, newPassword) => {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const updatedLines = lines.map(line => {
      if (line.startsWith('MONGODB_URI=')) {
        // Create new connection string with new user
        const newURI = `MONGODB_URI=mongodb+srv://${newUsername}:${newPassword}@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHaa?retryWrites=true&w=majority`;
        console.log('✅ Updated MONGODB_URI with new user');
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
  console.log('\n📋 Instructions to Create New MongoDB Atlas User:');
  console.log('=================================================');
  
  console.log('\n1️⃣ Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com');
  
  console.log('\n2️⃣ Navigate to Database Access:');
  console.log('   - Click "Database Access" in the left sidebar');
  console.log('   - Click "Add New Database User"');
  
  console.log('\n3️⃣ Create New User:');
  console.log('   - Authentication Method: Password');
  console.log('   - Username: telugu_user');
  console.log('   - Password: telugu123');
  console.log('   - Database User Privileges: "Read and write to any database"');
  console.log('   - Click "Add User"');
  
  console.log('\n4️⃣ Update Network Access (if needed):');
  console.log('   - Go to "Network Access" in left sidebar');
  console.log('   - Click "Add IP Address"');
  console.log('   - Click "Allow Access from Anywhere" (for development)');
  console.log('   - Click "Confirm"');
  
  console.log('\n5️⃣ Test Connection:');
  console.log('   - Run: node test-mongodb-connection.js');
};

const main = () => {
  console.log('\n🔧 Creating New MongoDB Atlas User...');
  console.log('=====================================');
  
  const newUsername = 'telugu_user';
  const newPassword = 'telugu123';
  
  console.log(`\n📋 New User Details:`);
  console.log(`   Username: ${newUsername}`);
  console.log(`   Password: ${newPassword}`);
  
  showInstructions();
  
  console.log('\n🔧 Ready to Update .env File?');
  console.log('=============================');
  console.log('This will update your .env file with the new user credentials.');
  console.log('Make sure you create the user in MongoDB Atlas first!');
  
  // Update the .env file
  if (updateEnvFile(newUsername, newPassword)) {
    console.log('\n✅ .env file updated with new user credentials!');
    console.log('\n📋 Updated MONGODB_URI:');
    console.log(`   mongodb+srv://${newUsername}:${newPassword}@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHaa?retryWrites=true&w=majority`);
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Create the user in MongoDB Atlas (follow instructions above)');
    console.log('2. Run: node test-mongodb-connection.js');
    console.log('3. If successful, restart your server');
  }
};

main();
