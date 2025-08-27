import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import LearningActivity from '../models/LearningActivity.js';
import User from '../models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 19 Milestone activities data
const milestoneActivities = [
  // Basic Telugu Alphabets (Milestones 1-3)
  {
    title: "ఆ నుంచి అహ వరకు",
    teluguTitle: "Vowels (Forward & Backward)",
    description: "Learn Telugu vowels from ఆ to అహ with forward and backward recitation",
    type: "video",
    category: "vowels",
    difficulty: "beginner",
    milestone: 1,
    order: 1,
    duration: 30,
    videoUrl: "/videos/milestone-1/video-1.mp4",
    videoThumbnail: "/videos/milestone-1/thumbnail.jpg",
    videoDuration: 1800, // 30 minutes in seconds
    practiceContent: "Practice reciting vowels forward and backward",
    practiceInstructions: "Start with ఆ and go through all vowels, then reverse",
    questions: [],
    voicePractice: {
      targetWords: ["ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః"],
      sampleAudioUrl: "/videos/milestone-1/sample-audio.mp3",
      instructions: "Practice each vowel with clear pronunciation"
    },
    tags: ["vowels", "basic", "pronunciation"],
    isPublished: true,
    isActive: true
  },
  {
    title: "క నుంచి బండి ర వరకు",
    teluguTitle: "Basic Consonants (Forward & Backward)",
    description: "Master basic consonants from క to బండి ర with forward and backward recitation",
    type: "video",
    category: "consonants",
    difficulty: "beginner",
    milestone: 2,
    order: 2,
    duration: 45,
    videoUrl: "/videos/milestone-2/video-2.mp4",
    videoThumbnail: "/videos/milestone-2/thumbnail.jpg",
    videoDuration: 2700, // 45 minutes in seconds
    practiceContent: "Practice reciting consonants forward and backward",
    practiceInstructions: "Start with క and go through all consonants, then reverse",
    questions: [],
    voicePractice: {
      targetWords: ["క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ", "ణ", "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ", "శ", "ష", "స", "హ", "ళ", "క్ష", "ఱ"],
      sampleAudioUrl: "/videos/milestone-2/sample-audio.mp3",
      instructions: "Practice each consonant with clear pronunciation"
    },
    tags: ["consonants", "basic", "pronunciation"],
    isPublished: true,
    isActive: true
  },
  {
    title: "తలకట్టు to విసర్గమ్",
    teluguTitle: "Special Characters and Modifiers",
    description: "Learn special characters, modifiers, and their usage in Telugu script",
    type: "video",
    category: "grammar",
    difficulty: "beginner",
    milestone: 3,
    order: 3,
    duration: 40,
    videoUrl: "/videos/milestone-3/video-3.mp4",
    videoThumbnail: "/videos/milestone-3/thumbnail.jpg",
    videoDuration: 2400, // 40 minutes in seconds
    practiceContent: "Practice special characters and modifiers",
    practiceInstructions: "Learn the usage of talakattu, gunintham, and visargam",
    questions: [],
    voicePractice: {
      targetWords: ["తలకట్టు", "గుణింతం", "విసర్గం", "అనునాసికం"],
      sampleAudioUrl: "/videos/milestone-3/sample-audio.mp3",
      instructions: "Practice special character pronunciation"
    },
    tags: ["special-characters", "modifiers", "grammar"],
    isPublished: true,
    isActive: true
  },
  // Guninthalu (Composite Letters) - Milestones 4-8
  {
    title: "గుణింతాలు మొదటి పద్దతి",
    teluguTitle: "First Method (5 Examples)",
    description: "Learn the first method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 4,
    order: 4,
    duration: 60,
    videoUrl: "/videos/milestone-4/video-4.mp4",
    videoThumbnail: "/videos/milestone-4/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu first method",
    practiceInstructions: "Learn 5 examples of guninthalu using the first method",
    questions: [],
    voicePractice: {
      targetWords: ["కా", "కి", "కీ", "కు", "కూ"],
      sampleAudioUrl: "/videos/milestone-4/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  {
    title: "గుణింతాలు రెండవ పద్దతి",
    teluguTitle: "Second Method (5 Examples)",
    description: "Learn the second method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 5,
    order: 5,
    duration: 60,
    videoUrl: "/videos/milestone-5/video-5.mp4",
    videoThumbnail: "/videos/milestone-5/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu second method",
    practiceInstructions: "Learn 5 examples of guninthalu using the second method",
    questions: [],
    voicePractice: {
      targetWords: ["కె", "కే", "కై", "కొ", "కో"],
      sampleAudioUrl: "/videos/milestone-5/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  {
    title: "గుణింతాలు మూడవ పద్దతి",
    teluguTitle: "Third Method (5 Examples)",
    description: "Learn the third method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 6,
    order: 6,
    duration: 60,
    videoUrl: "/videos/milestone-6/video-6.mp4",
    videoThumbnail: "/videos/milestone-6/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu third method",
    practiceInstructions: "Learn 5 examples of guninthalu using the third method",
    questions: [],
    voicePractice: {
      targetWords: ["కౌ", "కం", "కః", "కృ", "కౄ"],
      sampleAudioUrl: "/videos/milestone-6/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  {
    title: "గుణింతాలు నాలుగవ పద్దతి",
    teluguTitle: "Fourth Method (5 Examples)",
    description: "Learn the fourth method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 7,
    order: 7,
    duration: 60,
    videoUrl: "/videos/milestone-7/video-7.mp4",
    videoThumbnail: "/videos/milestone-7/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu fourth method",
    practiceInstructions: "Learn 5 examples of guninthalu using the fourth method",
    questions: [],
    voicePractice: {
      targetWords: ["కౢ", "కౣ", "క౦", "క౧", "క౨"],
      sampleAudioUrl: "/videos/milestone-7/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  {
    title: "గుణింతాలు అయిదవ పద్దతి",
    teluguTitle: "Fifth Method (5 Examples)",
    description: "Learn the fifth method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 8,
    order: 8,
    duration: 60,
    videoUrl: "/videos/milestone-8/video-8.mp4",
    videoThumbnail: "/videos/milestone-8/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu fifth method",
    practiceInstructions: "Learn 5 examples of guninthalu using the fifth method",
    questions: [],
    voicePractice: {
      targetWords: ["క౩", "క౪", "క౫", "క౬", "క౭"],
      sampleAudioUrl: "/videos/milestone-8/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  {
    title: "గుణింతాలు ఆరవ పద్దతి",
    teluguTitle: "Sixth Method (5 Examples)",
    description: "Learn the sixth method of guninthalu with 5 examples forward and backward",
    type: "video",
    category: "grammar",
    difficulty: "intermediate",
    milestone: 9,
    order: 9,
    duration: 60,
    videoUrl: "/videos/milestone-9/video-9.mp4",
    videoThumbnail: "/videos/milestone-9/thumbnail.jpg",
    videoDuration: 3600, // 60 minutes in seconds
    practiceContent: "Practice guninthalu sixth method",
    practiceInstructions: "Learn 5 examples of guninthalu using the sixth method",
    questions: [],
    voicePractice: {
      targetWords: ["క౮", "క౯", "క౰", "క౱", "క౲"],
      sampleAudioUrl: "/videos/milestone-9/sample-audio.mp3",
      instructions: "Practice guninthalu combinations"
    },
    tags: ["guninthalu", "composite-letters", "intermediate"],
    isPublished: true,
    isActive: true
  },
  // Four Step Method - Milestones 10-16
  {
    title: "Four Step Method - Stage One",
    teluguTitle: "Foundational Methodology",
    description: "Master the foundational four-step methodology for word formation",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 10,
    order: 10,
    duration: 120,
    videoUrl: "/videos/milestone-10/video-10.mp4",
    videoThumbnail: "/videos/milestone-10/thumbnail.jpg",
    videoDuration: 7200, // 120 minutes in seconds
    practiceContent: "Practice four-step method stage one",
    practiceInstructions: "Learn the foundational methodology for word formation",
    questions: [],
    voicePractice: {
      targetWords: ["కల", "కలి", "కలు", "కలా"],
      sampleAudioUrl: "/videos/milestone-10/sample-audio.mp3",
      instructions: "Practice four-step word formation"
    },
    tags: ["four-step-method", "word-formation", "advanced"],
    isPublished: true,
    isActive: true
  },
  {
    title: "Four Step Method - Stage Two",
    teluguTitle: "Advanced Methodology",
    description: "Learn advanced four-step methodology for complex word formation",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 11,
    order: 11,
    duration: 120,
    videoUrl: "/videos/milestone-11/video-11.mp4",
    videoThumbnail: "/videos/milestone-11/thumbnail.jpg",
    videoDuration: 7200, // 120 minutes in seconds
    practiceContent: "Practice four-step method stage two",
    practiceInstructions: "Learn advanced methodology for complex word formation",
    questions: [],
    voicePractice: {
      targetWords: ["కలికి", "కలికి", "కలికి", "కలికి"],
      sampleAudioUrl: "/videos/milestone-11/sample-audio.mp3",
      instructions: "Practice advanced four-step word formation"
    },
    tags: ["four-step-method", "advanced", "complex-words"],
    isPublished: true,
    isActive: true
  },
  {
    title: "10 ద్విత్వాక్షర పదాలు",
    teluguTitle: "Double Letter Words (Four Step Method)",
    description: "Practice 10 double letter words using the four-step method",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 12,
    order: 12,
    duration: 90,
    videoUrl: "/videos/milestone-12/video-12.mp4",
    videoThumbnail: "/videos/milestone-12/thumbnail.jpg",
    videoDuration: 5400, // 90 minutes in seconds
    practiceContent: "Practice double letter words",
    practiceInstructions: "Learn 10 double letter words using four-step method",
    questions: [],
    voicePractice: {
      targetWords: ["కల్ల", "పల్ల", "మల్ల", "వల్ల", "చల్ల", "తల్ల", "నల్ల", "బల్ల", "రల్ల", "లల్ల"],
      sampleAudioUrl: "/videos/milestone-12/sample-audio.mp3",
      instructions: "Practice double letter word pronunciation"
    },
    tags: ["double-letters", "four-step-method", "advanced"],
    isPublished: true,
    isActive: true
  },
  {
    title: "10 సంయుక్తాక్షర పదాలు",
    teluguTitle: "Compound Letter Words (Four Step Method)",
    description: "Learn 10 compound letter words using the four-step method",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 13,
    order: 13,
    duration: 90,
    videoUrl: "/videos/milestone-13/video-13.mp4",
    videoThumbnail: "/videos/milestone-13/thumbnail.jpg",
    videoDuration: 5400, // 90 minutes in seconds
    practiceContent: "Practice compound letter words",
    practiceInstructions: "Learn 10 compound letter words using four-step method",
    questions: [],
    voicePractice: {
      targetWords: ["క్ష", "త్ర", "జ్ఞ", "శ్ర", "ద్ర", "ప్ర", "బ్ర", "మ్ర", "వ్ర", "ల్ర"],
      sampleAudioUrl: "/videos/milestone-13/sample-audio.mp3",
      instructions: "Practice compound letter word pronunciation"
    },
    tags: ["compound-letters", "four-step-method", "advanced"],
    isPublished: true,
    isActive: true
  },
  {
    title: "10 రెండు ద్విత్వాక్షార పదాలు",
    teluguTitle: "Two Double Letter Words",
    description: "Master 10 words with two double letters using advanced techniques",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 14,
    order: 14,
    duration: 105,
    videoUrl: "/videos/milestone-14/video-14.mp4",
    videoThumbnail: "/videos/milestone-14/thumbnail.jpg",
    videoDuration: 6300, // 105 minutes in seconds
    practiceContent: "Practice two double letter words",
    practiceInstructions: "Learn 10 words with two double letters using advanced techniques",
    questions: [],
    voicePractice: {
      targetWords: ["కల్లల్ల", "పల్లల్ల", "మల్లల్ల", "వల్లల్ల", "చల్లల్ల", "తల్లల్ల", "నల్లల్ల", "బల్లల్ల", "రల్లల్ల", "లల్లల్ల"],
      sampleAudioUrl: "/videos/milestone-14/sample-audio.mp3",
      instructions: "Practice two double letter word pronunciation"
    },
    tags: ["two-double-letters", "advanced", "complex-words"],
    isPublished: true,
    isActive: true
  },
  {
    title: "10 రెండు సంయుక్తాక్షార పదాలు",
    teluguTitle: "Two Compound Letter Words",
    description: "Practice 10 words with two compound letters using advanced techniques",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 15,
    order: 15,
    duration: 105,
    videoUrl: "/videos/milestone-15/video-15.mp4",
    videoThumbnail: "/videos/milestone-15/thumbnail.jpg",
    videoDuration: 6300, // 105 minutes in seconds
    practiceContent: "Practice two compound letter words",
    practiceInstructions: "Learn 10 words with two compound letters using advanced techniques",
    questions: [],
    voicePractice: {
      targetWords: ["క్షత్ర", "జ్ఞశ్ర", "ద్రప్ర", "బ్రమ్ర", "వ్రల్ర", "క్షజ్ఞ", "శ్రద్ర", "ప్రబ్ర", "మ్రవ్ర", "ల్రక్ష"],
      sampleAudioUrl: "/videos/milestone-15/sample-audio.mp3",
      instructions: "Practice two compound letter word pronunciation"
    },
    tags: ["two-compound-letters", "advanced", "complex-words"],
    isPublished: true,
    isActive: true
  },
  {
    title: "10 సంశ్లేష అక్షరపదాలు",
    teluguTitle: "Complex Combination Words",
    description: "Learn 10 complex combination words with multiple letter modifications",
    type: "video",
    category: "vocabulary",
    difficulty: "advanced",
    milestone: 16,
    order: 16,
    duration: 120,
    videoUrl: "/videos/milestone-16/video-16.mp4",
    videoThumbnail: "/videos/milestone-16/thumbnail.jpg",
    videoDuration: 7200, // 120 minutes in seconds
    practiceContent: "Practice complex combination words",
    practiceInstructions: "Learn 10 complex combination words with multiple letter modifications",
    questions: [],
    voicePractice: {
      targetWords: ["క్షత్రజ్ఞ", "శ్రద్రప్ర", "బ్రమ్రవ్ర", "ల్రక్షత్ర", "జ్ఞశ్రద్ర", "ప్రబ్రమ్ర", "వ్రల్రక్ష", "త్రజ్ఞశ్ర", "ద్రప్రబ్ర", "మ్రవ్రల్ర"],
      sampleAudioUrl: "/videos/milestone-16/sample-audio.mp3",
      instructions: "Practice complex combination word pronunciation"
    },
    tags: ["complex-combinations", "advanced", "multiple-modifications"],
    isPublished: true,
    isActive: true
  },
  // Advanced Pronunciation - Milestones 17-19
  {
    title: "Complete Letter Modification for Emphasis",
    teluguTitle: "Full Consonant Changes",
    description: "Learn complete letter modification techniques for emphasis in pronunciation",
    type: "video",
    category: "pronunciation",
    difficulty: "advanced",
    milestone: 17,
    order: 17,
    duration: 90,
    videoUrl: "/videos/milestone-17/video-17.mp4",
    videoThumbnail: "/videos/milestone-17/thumbnail.jpg",
    videoDuration: 5400, // 90 minutes in seconds
    practiceContent: "Practice complete letter modification",
    practiceInstructions: "Learn complete letter modification techniques for emphasis",
    questions: [],
    voicePractice: {
      targetWords: ["కల్ల", "పల్ల", "మల్ల", "వల్ల", "చల్ల"],
      sampleAudioUrl: "/videos/milestone-17/sample-audio.mp3",
      instructions: "Practice complete letter modification for emphasis"
    },
    tags: ["letter-modification", "emphasis", "advanced-pronunciation"],
    isPublished: true,
    isActive: true
  },
  {
    title: "Removing Headmarks for Emphasis",
    teluguTitle: "Talakattu Removal Techniques",
    description: "Master techniques for removing headmarks (talakattu) for emphasis",
    type: "video",
    category: "pronunciation",
    difficulty: "advanced",
    milestone: 18,
    order: 18,
    duration: 90,
    videoUrl: "/videos/milestone-18/video-18.mp4",
    videoThumbnail: "/videos/milestone-18/thumbnail.jpg",
    videoDuration: 5400, // 90 minutes in seconds
    practiceContent: "Practice removing headmarks for emphasis",
    practiceInstructions: "Learn techniques for removing talakattu for emphasis",
    questions: [],
    voicePractice: {
      targetWords: ["కల", "పల", "మల", "వల", "చల"],
      sampleAudioUrl: "/videos/milestone-18/sample-audio.mp3",
      instructions: "Practice removing headmarks for emphasis"
    },
    tags: ["headmark-removal", "talakattu", "emphasis", "advanced-pronunciation"],
    isPublished: true,
    isActive: true
  },
  {
    title: "Natural Emphasis without Modifications",
    teluguTitle: "Inherent Pronunciation Patterns",
    description: "Learn natural emphasis patterns without letter modifications",
    type: "video",
    category: "pronunciation",
    difficulty: "advanced",
    milestone: 19,
    order: 19,
    duration: 90,
    videoUrl: "/videos/milestone-19/video-19.mp4",
    videoThumbnail: "/videos/milestone-19/thumbnail.jpg",
    videoDuration: 5400, // 90 minutes in seconds
    practiceContent: "Practice natural emphasis patterns",
    practiceInstructions: "Learn natural emphasis patterns without letter modifications",
    questions: [],
    voicePractice: {
      targetWords: ["కల", "పల", "మల", "వల", "చల"],
      sampleAudioUrl: "/videos/milestone-19/sample-audio.mp3",
      instructions: "Practice natural emphasis patterns"
    },
    tags: ["natural-emphasis", "inherent-patterns", "advanced-pronunciation"],
    isPublished: true,
    isActive: true
  }
];

// Create placeholder video files
const createPlaceholderFiles = () => {
  const videosDir = path.join(__dirname, '..', 'public', 'videos');
  
  for (let i = 1; i <= 19; i++) {
    const milestoneDir = path.join(videosDir, `milestone-${i}`);
    
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

// Setup function
const setupVideos = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Create placeholder files
    createPlaceholderFiles();

    // Find or create an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      console.log('You can create one by registering a user and then updating their role to "admin" in the database.');
      process.exit(1);
    }

    // Clear existing activities
    await LearningActivity.deleteMany({});
    console.log('Cleared existing activities');

    // Create activities
    const createdActivities = [];
    for (const activityData of milestoneActivities) {
      const activity = new LearningActivity({
        ...activityData,
        createdBy: adminUser._id
      });
      await activity.save();
      createdActivities.push(activity);
      console.log(`Created activity: ${activity.title} (Milestone ${activity.milestone})`);
    }

    console.log(`\n✅ Successfully created ${createdActivities.length} milestone activities`);
    console.log('📁 Video files are stored locally in: server/public/videos/');
    console.log('🎥 You can now replace the placeholder files with actual video content');
    console.log('📝 Each milestone has its own folder: milestone-1, milestone-2, etc.');
    console.log('🔗 Videos will be accessible at: https://service-3-backend-production.up.railway.app/videos/milestone-X/video-X.mp4');

  } catch (error) {
    console.error('Error setting up videos:', error);
  } finally {
    process.exit(0);
  }
};

// Run the setup
setupVideos(); 