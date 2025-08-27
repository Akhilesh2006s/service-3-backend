# Local Video Storage System

This system stores videos locally instead of using cloud storage. All 19 milestone videos are organized in the `public/videos/` directory.

## Directory Structure

```
server/public/videos/
├── milestone-1/
│   ├── video-1.mp4
│   ├── thumbnail.jpg
│   └── sample-audio.mp3
├── milestone-2/
│   ├── video-2.mp4
│   ├── thumbnail.jpg
│   └── sample-audio.mp3
...
└── milestone-19/
    ├── video-19.mp4
    ├── thumbnail.jpg
    └── sample-audio.mp3
```

## Setup Instructions

### 1. Run the Setup Script

First, make sure you have an admin user in your database, then run:

```bash
cd server
node scripts/setup-videos.js
```

This will:
- Create all 19 milestone activities in the database
- Create placeholder files for videos, thumbnails, and audio
- Set up the proper file structure

### 2. Replace Placeholder Files

Replace the placeholder files with your actual video content:

- **Videos**: Replace `video-X.mp4` files with your actual milestone videos
- **Thumbnails**: Replace `thumbnail.jpg` files with video thumbnails
- **Audio**: Replace `sample-audio.mp3` files with sample pronunciation audio

### 3. Video File Requirements

- **Format**: MP4 (recommended) or other web-compatible formats
- **Size**: Up to 500MB per video (configurable in `routes/activities.js`)
- **Resolution**: 720p or higher recommended
- **Duration**: Varies by milestone (30-120 minutes)

## Accessing Videos

### Frontend Access
Videos are served statically and accessible at:
```
https://service-3-backend-production.up.railway.app/videos/milestone-1/video-1.mp4
https://service-3-backend-production.up.railway.app/videos/milestone-2/video-2.mp4
...
https://service-3-backend-production.up.railway.app/videos/milestone-19/video-19.mp4
```

### API Access
The backend provides video URLs through the activities API:
```
GET /api/activities
```

## Milestone Overview

### Basic Telugu Alphabets (Milestones 1-3)
1. **ఆ నుంచి అహ వరకు** - Vowels (Forward & Backward)
2. **క నుంచి బండి ర వరకు** - Basic Consonants (Forward & Backward)
3. **తలకట్టు to విసర్గమ్** - Special Characters and Modifiers

### Guninthalu (Composite Letters) - Milestones 4-9
4. **గుణింతాలు మొదటి పద్దతి** - First Method (5 Examples)
5. **గుణింతాలు రెండవ పద్దతి** - Second Method (5 Examples)
6. **గుణింతాలు మూడవ పద్దతి** - Third Method (5 Examples)
7. **గుణింతాలు నాలుగవ పద్దతి** - Fourth Method (5 Examples)
8. **గుణింతాలు అయిదవ పద్దతి** - Fifth Method (5 Examples)
9. **గుణింతాలు ఆరవ పద్దతి** - Sixth Method (5 Examples)

### Four Step Method - Milestones 10-16
10. **Four Step Method - Stage One** - Foundational Methodology
11. **Four Step Method - Stage Two** - Advanced Methodology
12. **10 ద్విత్వాక్షర పదాలు** - Double Letter Words
13. **10 సంయుక్తాక్షర పదాలు** - Compound Letter Words
14. **10 రెండు ద్విత్వాక్షార పదాలు** - Two Double Letter Words
15. **10 రెండు సంయుక్తాక్షార పదాలు** - Two Compound Letter Words
16. **10 సంశ్లేష అక్షరపదాలు** - Complex Combination Words

### Advanced Pronunciation - Milestones 17-19
17. **Complete Letter Modification for Emphasis** - Full Consonant Changes
18. **Removing Headmarks for Emphasis** - Talakattu Removal Techniques
19. **Natural Emphasis without Modifications** - Inherent Pronunciation Patterns

## Configuration

### File Upload Limits
- **Maximum file size**: 500MB (configurable in `routes/activities.js`)
- **Allowed formats**: Video and audio files
- **Storage location**: `server/public/videos/`

### Server Configuration
The server is configured to serve static files from the `public` directory:
```javascript
app.use(express.static('public'));
```

## Troubleshooting

### Video Not Playing
1. Check if the video file exists in the correct milestone folder
2. Verify the file format is web-compatible (MP4 recommended)
3. Check file permissions
4. Ensure the server is running on the correct port

### Upload Issues
1. Check file size (max 500MB)
2. Verify file format (video/audio only)
3. Ensure milestone directory exists
4. Check server logs for errors

### Database Issues
1. Run the setup script again: `node scripts/setup-videos.js`
2. Check MongoDB connection
3. Verify admin user exists

## Security Notes

- Videos are served publicly from the `public` directory
- No authentication required to access video files
- Consider implementing access control if needed
- Monitor disk space usage for large video files

## Performance Tips

- Compress videos to reduce file size
- Use appropriate video codecs (H.264 recommended)
- Consider implementing video streaming for large files
- Monitor server performance with large video files 