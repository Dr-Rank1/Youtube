# YouTube Video Downloader

A modern Next.js web application for downloading YouTube videos through share links.

## Features

- Clean and modern UI with gradient background
- Paste YouTube URL to fetch video information
- View video details (title, thumbnail, duration, author)
- Download videos in different quality options (highest/lowest)
- Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- Responsive design
- Uses yt-dlp for reliable downloads

## Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager
- **yt-dlp** installed (required for downloading videos)

## Installing yt-dlp

### Windows

**Option 1: Using pip (recommended)**
```bash
pip install yt-dlp
```

**Option 2: Using Chocolatey**
```bash
choco install yt-dlp
```

**Option 3: Download binary**
1. Download from: https://github.com/yt-dlp/yt-dlp/releases
2. Rename to `yt-dlp.exe`
3. Add to your PATH or place in project folder

### macOS

```bash
brew install yt-dlp
```

### Linux

```bash
# Using pip
pip install yt-dlp

# Or using apt (Ubuntu/Debian)
sudo apt install yt-dlp
```

Verify installation:
```bash
yt-dlp --version
```

## Installation

1. Navigate to the project directory:
```bash
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) and click "Get Video Info"

4. Once the video information is loaded, you can download the video in your preferred quality

## Building for Production

To create a production build:

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **yt-dlp** - YouTube video downloader (backend)

## Project Structure

```
youtube-downloader/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.ts       # API endpoint using yt-dlp
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Main page with download UI
├── temp/                      # Temporary download folder (auto-created)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── IMPORTANT_NOTE.md          # Info about YouTube download issues
└── README.md
```

## How It Works

1. **Frontend (app/page.tsx)**:
   - User inputs YouTube URL
   - Sends POST request to API to fetch video info
   - Displays video details and download buttons
   - Handles download by making GET request to API

2. **Backend (app/api/download/route.ts)**:
   - POST endpoint: Uses yt-dlp to fetch video metadata
   - GET endpoint: Downloads video using yt-dlp and serves it
   - Temporary files are cleaned up automatically

## Important Notes

- This application is for educational purposes only
- Please respect YouTube's Terms of Service and copyright laws
- **yt-dlp must be installed** for the app to work
- Some videos may not be downloadable due to restrictions
- Download speeds depend on your internet connection and YouTube's servers
- Videos are temporarily stored in the `/temp` folder during download

## Why yt-dlp?

JavaScript libraries like `ytdl-core` and `@distube/ytdl-core` frequently break due to YouTube's anti-bot measures. `yt-dlp` is:
- More reliable and actively maintained
- Bypasses most YouTube restrictions
- Regularly updated to handle YouTube changes
- Industry standard for YouTube downloads

See [IMPORTANT_NOTE.md](IMPORTANT_NOTE.md) for more details about YouTube download library issues.

## Troubleshooting

### "yt-dlp is not installed" error

Install yt-dlp using one of the methods above and ensure it's in your system PATH.

```bash
# Test if yt-dlp is installed
yt-dlp --version
```

### Other issues

1. Make sure all dependencies are installed: `npm install`
2. Check that you're using Node.js 18 or higher: `node --version`
3. Clear Next.js cache: `rm -rf .next` and restart the dev server
4. Some videos may be restricted - try a different video URL
5. Make sure you have write permissions for the `/temp` folder

### 403 Errors or "Sign in to confirm you're not a bot"

This is YouTube blocking the request. yt-dlp handles this better than JavaScript libraries, but some videos may still be restricted. Try:
- Using a different video
- Updating yt-dlp: `pip install -U yt-dlp`

## License

This project is provided as-is for educational purposes.
