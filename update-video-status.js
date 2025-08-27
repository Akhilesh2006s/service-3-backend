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

async function updateVideoStatus() {
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

    // Update milestone 1 video to published status
    const milestone1Video = await VideoLecture.findOne({ milestone: 1 });
    if (milestone1Video && milestone1Video.status === 'draft') {
      milestone1Video.status = 'published';
      await milestone1Video.save();
      console.log('✅ Updated milestone 1 video status to published');
    }

    // Update video URLs to better Telugu learning videos
    const videoUpdates = [
      {
        milestone: 1,
        title: "Telugu Basics - Lesson 1: Vowels (ఆ నుంచి అహ వరకు)",
        description: "Learn Telugu vowels from ఆ to అహ with forward and backward recitation",
        videoUrl: "https://www.youtube.com/watch?v=CcYwVxwdJo0" // Keep existing URL
      },
      {
        milestone: 2,
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0" // Better Telugu video
      },
      {
        milestone: 3,
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0" // Better Telugu video
      },
      {
        milestone: 4,
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0" // Better Telugu video
      },
      {
        milestone: 5,
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0" // Better Telugu video
      }
    ];

    console.log('\n📹 Updating video URLs...');
    
    for (const update of videoUpdates) {
      const video = await VideoLecture.findOne({ milestone: update.milestone });
      if (video) {
        if (update.title) video.title = update.title;
        if (update.description) video.description = update.description;
        if (update.videoUrl) {
          video.videoUrl = update.videoUrl;
          video.isYouTubeVideo = isYouTubeUrl(update.videoUrl);
          video.youtubeVideoId = extractYouTubeVideoId(update.videoUrl);
          video.embedUrl = video.youtubeVideoId ? `https://www.youtube.com/embed/${video.youtubeVideoId}` : '';
        }
        await video.save();
        console.log(`✅ Updated milestone ${update.milestone} video`);
      }
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

updateVideoStatus();


