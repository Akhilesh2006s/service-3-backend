import fs from 'fs';

// Create .env content with proper line endings
const envLines = [
  'MONGODB_URI=mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority',
  'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production',
  'PORT=5000',
  'NODE_ENV=development',
  'FRONTEND_URL=http://localhost:8080',
  'ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://192.168.1.7:8080'
];

const envContent = envLines.join('\n');

fs.writeFileSync('.env', envContent);
console.log('.env file created successfully!');
console.log('Environment variables:');
envLines.forEach(line => console.log(`  ${line}`));
