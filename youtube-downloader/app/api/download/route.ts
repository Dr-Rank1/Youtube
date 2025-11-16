import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execPromise = promisify(exec);

// Determine yt-dlp command based on platform
const getYtDlpCommand = () => {
  if (os.platform() === 'win32') {
    const windowsPath = 'C:\\Users\\IAN\\AppData\\Roaming\\Python\\Python314\\Scripts\\yt-dlp.exe';
    if (fs.existsSync(windowsPath)) {
      return windowsPath;
    }
  }
  return 'yt-dlp';
};

const YT_DLP = getYtDlpCommand();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    try {
      const { stdout } = await execPromise(
        `"${YT_DLP}" --dump-json "${url}"`,
        { timeout: 30000 }
      );

      const videoInfo = JSON.parse(stdout);

      const videoDetails = {
        title: videoInfo.title,
        author: videoInfo.uploader || videoInfo.channel,
        duration: formatDuration(videoInfo.duration || 0),
        thumbnail: videoInfo.thumbnail,
        viewCount: videoInfo.view_count,
        filesize: videoInfo.filesize || videoInfo.filesize_approx,
      };

      return NextResponse.json(videoDetails);
    } catch (ytDlpError: any) {
      if (ytDlpError.message.includes('yt-dlp') || ytDlpError.code === 'ENOENT') {
        return NextResponse.json(
          {
            error: 'yt-dlp is not installed. Please install it to use this feature.',
            instructions: 'Install from: https://github.com/yt-dlp/yt-dlp#installation'
          },
          { status: 503 }
        );
      }
      throw ytDlpError;
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const quality = searchParams.get('quality') || 'highest';

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    try {
      // Get video info
      const { stdout: infoStdout } = await execPromise(
        `"${YT_DLP}" --dump-json "${url}"`,
        { timeout: 30000 }
      );
      const videoInfo = JSON.parse(infoStdout);
      const cleanTitle = videoInfo.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50);

      // Determine format and content type based on quality selection
      let formatOption: string;
      let contentType: string = 'video/mp4';
      let fileExtension: string = 'mp4';

      switch (quality) {
        case 'audio':
          // Extract audio only as MP3
          formatOption = 'bestaudio[ext=m4a]/bestaudio';
          contentType = 'audio/mpeg';
          fileExtension = 'mp3';
          break;
        case 'highest':
        case '1080p':
          // Best quality up to 1080p
          formatOption = 'best[ext=mp4][height<=1080]/bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best';
          break;
        case '720p':
          // 720p HD
          formatOption = 'best[ext=mp4][height<=720]/bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[height<=720]';
          break;
        case '480p':
          // 480p SD
          formatOption = 'best[ext=mp4][height<=480]/bestvideo[ext=mp4][height<=480]+bestaudio[ext=m4a]/best[height<=480]';
          break;
        case '360p':
          // 360p Low quality
          formatOption = 'best[ext=mp4][height<=360]/bestvideo[ext=mp4][height<=360]+bestaudio[ext=m4a]/best[height<=360]';
          break;
        default:
          // Fallback to best quality
          formatOption = 'best[ext=mp4]/best';
      }

      console.log(`Starting download with format: ${formatOption} (${quality})`);

      // Spawn yt-dlp process with optimized settings
      const ytdlpArgs = [
        '-f', formatOption,
        '--no-playlist',           // Don't download playlists
        '--no-warnings',           // Reduce overhead
        '--no-call-home',          // Skip version check
        '--no-check-certificate',  // Skip SSL verification (faster)
        '--prefer-free-formats',   // Prefer formats that don't need post-processing
        '--buffer-size', '16K',    // Smaller buffer for faster streaming start
        '--http-chunk-size', '10M', // Download in chunks
      ];

      // Add audio extraction flags if audio only
      if (quality === 'audio') {
        ytdlpArgs.push(
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '0'  // Best audio quality
        );
      }

      ytdlpArgs.push('-o', '-', url); // Output to stdout

      const ytdlpProcess = spawn(YT_DLP, ytdlpArgs);

      let totalSize = 0;
      let downloadedSize = 0;

      // Create readable stream
      const stream = new ReadableStream({
        start(controller) {
          ytdlpProcess.stdout.on('data', (chunk) => {
            downloadedSize += chunk.length;
            controller.enqueue(chunk);
          });

          ytdlpProcess.stdout.on('end', () => {
            console.log('Download completed');
            controller.close();
          });

          ytdlpProcess.stderr.on('data', (data) => {
            const output = data.toString();

            // Parse progress information
            if (output.includes('ETA')) {
              console.log('Progress:', output.trim());
            }

            // Log errors
            if (output.includes('ERROR')) {
              console.error('yt-dlp error:', output);
            }
          });

          ytdlpProcess.on('error', (error) => {
            console.error('Process error:', error);
            controller.error(error);
          });

          ytdlpProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
              console.error(`yt-dlp exited with code ${code}`);
            }
          });
        },
        cancel() {
          ytdlpProcess.kill();
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${cleanTitle}.${fileExtension}"`,
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        },
      });

    } catch (ytDlpError: any) {
      if (ytDlpError.message.includes('yt-dlp') || ytDlpError.code === 'ENOENT') {
        return NextResponse.json(
          {
            error: 'yt-dlp is not installed. Please install it to use this feature.',
            instructions: 'Install from: https://github.com/yt-dlp/yt-dlp#installation'
          },
          { status: 503 }
        );
      }

      console.error('Download error:', ytDlpError);
      return NextResponse.json(
        { error: 'Failed to download video. The video might be restricted or requires login.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download video' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
