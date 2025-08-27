import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables
process.env.MONGODB_URI = 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHA?retryWrites=true&w=majority&appName=Cluster0';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-here';
process.env.PORT = '3001';
process.env.NODE_ENV = 'development';

// Create placeholder video files
const createPlaceholderFiles = () => {
  const videosDir = path.join(__dirname, 'public', 'videos');
  
  for (let i = 1; i <= 19; i++) {
    const milestoneDir = path.join(videosDir, `milestone-${i}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(milestoneDir)) {
      fs.mkdirSync(milestoneDir, { recursive: true });
    }
    
    // Create video placeholder
    const videoPath = path.join(milestoneDir, `video-${i}.mp4`);
    if (!fs.existsSync(videoPath)) {
      fs.writeFileSync(videoPath, 'PLACEHOLDER_VIDEO_FILE');
      console.log(`Created placeholder video: ${videoPath}`);
    }
    
    // Create thumbnail placeholder
    const thumbnailPath = path.join(milestoneDir, 'thumbnail.jpg');
    if (!fs.existsSync(thumbnailPath)) {
      fs.writeFileSync(thumbnailPath, 'PLACEHOLDER_THUMBNAIL');
      console.log(`Created placeholder thumbnail: ${thumbnailPath}`);
    }
    
    // Create sample audio placeholder
    const audioPath = path.join(milestoneDir, 'sample-audio.mp3');
    if (!fs.existsSync(audioPath)) {
      fs.writeFileSync(audioPath, 'PLACEHOLDER_AUDIO_FILE');
      console.log(`Created placeholder audio: ${audioPath}`);
    }
  }
};

// Run the setup
console.log('Setting up local video storage system...');
createPlaceholderFiles();
console.log('\n✅ Successfully created placeholder files for all 19 milestones');
console.log('📁 Video files are stored locally in: server/public/videos/');
console.log('🎥 You can now replace the placeholder files with actual video content');
console.log('📝 Each milestone has its own folder: milestone-1, milestone-2, etc.');
console.log('🔗 Videos will be accessible at: https://service-3-backend-production.up.railway.app/videos/milestone-X/video-X.mp4');
console.log('\n📋 Next steps:');
console.log('1. Replace placeholder files with actual video content');
console.log('2. Start the server: npm start');
console.log('3. Access videos through the application'); 