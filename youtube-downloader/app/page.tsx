'use client';

import { useState, useEffect } from 'react';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Extract YouTube video ID from various URL formats
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

type QualityOption = 'highest' | '1080p' | '720p' | '480p' | '360p' | 'audio';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instructions, setInstructions] = useState('');
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>('highest');

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const videoId = extractVideoId(text);
      if (videoId) {
        setUrl(text);
        setSuccess('URL detected from clipboard!');
      } else {
        setError('No valid YouTube URL found in clipboard');
      }
    } catch (err) {
      setError('Failed to read clipboard. Please paste manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInstructions('');
    setVideoInfo(null);
    setSuccess('');

    // Validate URL
    if (!extractVideoId(url)) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.instructions) {
          setInstructions(data.instructions);
        }
        throw new Error(data.error || 'Failed to process video');
      }

      setVideoInfo(data);
      setSuccess('Video information loaded successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (quality: QualityOption) => {
    setLoading(true);
    setError('');
    setInstructions('');
    setSuccess('');

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}`;
      const isAudio = quality === 'audio';
      const extension = isAudio ? 'mp3' : 'mp4';
      const filename = `${videoInfo?.title?.replace(/[^a-zA-Z0-9 ]/g, '') || 'video'}.${extension}`;

      // Create download link directly
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);

      // Trigger download
      link.click();
      setSuccess(`Download started! Check your downloads folder for "${filename}"`);

      // Cleanup after a short delay
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        setLoading(false);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during download');
      setLoading(false);
    }
  };

  const getQualityLabel = (quality: QualityOption): string => {
    const labels: Record<QualityOption, string> = {
      'highest': 'Best Quality (1080p)',
      '1080p': 'Full HD (1080p)',
      '720p': 'HD (720p)',
      '480p': 'SD (480p)',
      '360p': 'Low Quality (360p)',
      'audio': 'Audio Only (MP3)'
    };
    return labels[quality];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
          YouTube Video Downloader
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Paste a YouTube link and download your video
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <div className="flex gap-2">
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or paste link"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
                required
              />
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 flex items-center gap-2"
                title="Paste from clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Processing...' : 'Get Video Info'}
          </button>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fade-in">
            <p className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold mb-2">{error}</p>
            {instructions && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-gray-700 font-medium mb-2">Installation Required:</p>
                <p className="text-sm text-gray-600">{instructions}</p>
                <a
                  href="https://github.com/yt-dlp/yt-dlp#installation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View Installation Guide
                </a>
              </div>
            )}
          </div>
        )}

        {videoInfo && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {videoInfo.title}
            </h2>

            {videoInfo.thumbnail && (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full rounded-lg mb-4 shadow-md"
              />
            )}

            <div className="space-y-2 mb-4">
              <p className="text-gray-600">
                <span className="font-medium">Duration:</span> {videoInfo.duration}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Author:</span> {videoInfo.author}
              </p>
              {videoInfo.filesize && (
                <p className="text-gray-600">
                  <span className="font-medium">Approx. Size:</span> {formatFileSize(videoInfo.filesize)}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-700 mb-3">Select Quality & Download:</p>

              {loading && (
                <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Preparing download...
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your download will start in your browser shortly!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Selection Radio Buttons */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                {(['highest', '1080p', '720p', '480p', '360p', 'audio'] as QualityOption[]).map((quality) => (
                  <label key={quality} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition">
                    <input
                      type="radio"
                      name="quality"
                      value={quality}
                      checked={selectedQuality === quality}
                      onChange={(e) => setSelectedQuality(e.target.value as QualityOption)}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-800 font-medium">{getQualityLabel(quality)}</span>
                    {quality === 'audio' && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">MP3</span>
                    )}
                    {quality === 'highest' && (
                      <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
                    )}
                  </label>
                ))}
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(selectedQuality)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{loading ? 'Starting Download...' : `Download ${selectedQuality === 'audio' ? 'Audio' : 'Video'}`}</span>
                </div>
              </button>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-gray-700 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Tip:</strong> Higher quality = larger file size. Choose 480p or 360p for faster downloads.
                    Audio only extracts just the sound as MP3.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For educational purposes only. Please respect copyright laws.</p>
        </div>
      </div>
    </div>
  );
}
