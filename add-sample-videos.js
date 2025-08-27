import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

// YouTube video ID extraction function
const extractYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Check if URL is YouTube
const isYouTubeUrl = (url) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

async function addSampleVideos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the VideoLecture model
    const VideoLecture = mongoose.model('VideoLecture', new mongoose.Schema({
      title: String,
      description: String,
      milestone: Number,
      videoUrl: String,
      thumbnailUrl: String,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['draft', 'published'], default: 'published' },
      isYouTubeVideo: Boolean,
      youtubeVideoId: String,
      embedUrl: String,
      createdAt: { type: Date, default: Date.now }
    }));

    // Sample YouTube videos for Telugu learning (these are educational Telugu videos)
    const sampleVideos = [
      {
        title: "Telugu Basics - Lesson 1: Vowels (ఆ నుంచి అహ వరకు)",
        description: "Learn Telugu vowels from ఆ to అహ with forward and backward recitation",
        milestone: 1,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
        isYouTubeVideo: true
      },
      {
        title: "Telugu Basics - Lesson 2: Consonants (క నుంచి బండి ర వరకు)",
        description: "Master basic consonants from క to బండి ర with forward and backward recitation",
        milestone: 2,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
        isYouTubeVideo: true
      },
      {
        title: "Telugu Basics - Lesson 3: Special Characters",
        description: "Learn special characters, modifiers, and their usage in Telugu script",
        milestone: 3,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
        isYouTubeVideo: true
      },
      {
        title: "Telugu Basics - Lesson 4: Guninthalu Method 1",
        description: "Learn the first method of guninthalu with 5 examples forward and backward",
        milestone: 4,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
        isYouTubeVideo: true
      },
      {
        title: "Telugu Basics - Lesson 5: Guninthalu Method 2",
        description: "Master the second method of guninthalu with 5 examples forward and backward",
        milestone: 5,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
        isYouTubeVideo: true
      }
    ];

    console.log('\n📹 Adding sample video lectures...');
    
    for (const videoData of sampleVideos) {
      // Check if video already exists for this milestone
      const existingVideo = await VideoLecture.findOne({ milestone: videoData.milestone });
      
      if (existingVideo) {
        console.log(`⚠️ Video for milestone ${videoData.milestone} already exists, skipping...`);
        continue;
      }

      // Extract YouTube video ID and create embed URL
      const youtubeVideoId = extractYouTubeVideoId(videoData.videoUrl);
      const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '';

      // Create video lecture
      const videoLecture = new VideoLecture({
        title: videoData.title,
        description: videoData.description,
        milestone: videoData.milestone,
        videoUrl: videoData.videoUrl,
        thumbnailUrl: '',
        createdBy: '6898366e58013a79a1348505', // Use the evaluator user ID as trainer
        status: 'published',
        isYouTubeVideo: videoData.isYouTubeVideo,
        youtubeVideoId,
        embedUrl
      });

      await videoLecture.save();
      console.log(`✅ Added video for milestone ${videoData.milestone}: ${videoData.title}`);
    }

    // List all video lectures
    const allVideos = await VideoLecture.find().sort({ milestone: 1 });
    console.log('\n📋 All Video Lectures:');
    allVideos.forEach((video, index) => {
      console.log(`${index + 1}. Milestone ${video.milestone}: ${video.title}`);
      console.log(`   URL: ${video.videoUrl}`);
      console.log(`   YouTube: ${video.isYouTubeVideo}`);
      console.log(`   Status: ${video.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleVideos();


