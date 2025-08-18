// MongoDB Configuration
// Copy this to your .env file or set as environment variable

export const config = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://telugu_user:telugu123@cluster0.mongodb.net/telugu-learning?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Instructions:
// 1. Create a .env file in the server directory
// 2. Add: MONGODB_URI=your_actual_mongodb_atlas_connection_string
// 3. Add: JWT_SECRET=your_secret_key
// 4. Restart your server
