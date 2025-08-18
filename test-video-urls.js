import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test video URL generation
const testVideoUrls = () => {
  const videosDir = path.join(__dirname, 'public', 'videos');
  
  console.log('Testing video URL generation for all 19 milestones...\n');
  
  for (let i = 1; i <= 19; i++) {
    const milestoneDir = path.join(videosDir, `milestone-${i}`);
    const videoPath = path.join(milestoneDir, `video-${i}.mp4`);
    const thumbnailPath = path.join(milestoneDir, 'thumbnail.jpg');
    const audioPath = path.join(milestoneDir, 'sample-audio.mp3');
    
    // Check if files exist
    const videoExists = fs.existsSync(videoPath);
    const thumbnailExists = fs.existsSync(thumbnailPath);
    const audioExists = fs.existsSync(audioPath);
    
    // Generate URLs
    const videoUrl = `/videos/milestone-${i}/video-${i}.mp4`;
    const thumbnailUrl = `/videos/milestone-${i}/thumbnail.jpg`;
    const audioUrl = `/videos/milestone-${i}/sample-audio.mp3`;
    
    console.log(`Milestone ${i}:`);
    console.log(`  Video: ${videoUrl} ${videoExists ? '✅' : '❌'}`);
    console.log(`  Thumbnail: ${thumbnailUrl} ${thumbnailExists ? '✅' : '❌'}`);
    console.log(`  Audio: ${audioUrl} ${audioExists ? '✅' : '❌'}`);
    console.log('');
  }
  
  console.log('✅ Video URL testing completed!');
  console.log('📝 All videos will be accessible at: https://backend-production-e051.up.railway.app/videos/milestone-X/video-X.mp4');
  console.log('🎥 Replace placeholder files with actual video content');
};

testVideoUrls(); 