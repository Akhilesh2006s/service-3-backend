# PowerShell script to set up environment variables for MongoDB
# Run this script as Administrator

Write-Host "Setting up MongoDB environment variables..." -ForegroundColor Green

# Create .env file content
$envContent = @"
# MongoDB Configuration
MONGODB_URI=mongodb+srv://telugu_user:telugu123@cluster0.mongodb.net/telugu-learning?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:3000,http://192.168.1.7:5173
"@

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host "📝 Please update the MONGODB_URI with your actual MongoDB Atlas connection string" -ForegroundColor Yellow
Write-Host "🔑 Update the JWT_SECRET with a secure random string" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your actual MongoDB credentials" -ForegroundColor White
Write-Host "2. Run: node setup-mongodb.js" -ForegroundColor White
Write-Host "3. Run: node server.js" -ForegroundColor White
