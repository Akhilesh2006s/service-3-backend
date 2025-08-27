import fs from 'fs';

console.log('🔧 Creating .env file');
console.log('====================');

const envContent = `MONGODB_URI=mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=1ec1af88f3417fb4e39c461453f956bc
FRONTEND_URL=http://192.168.1.7:5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://192.168.1.7:8080,http://192.168.1.7:3000,http://192.168.1.7:5173`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');
  console.log('\n📋 .env file content:');
  console.log(envContent);
} catch (error) {
  console.log('❌ Error creating .env file:', error.message);
}
