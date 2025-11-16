# How to Install yt-dlp

## Quick Installation Guide

yt-dlp is required for this application to work. Follow the instructions below for your operating system.

## Windows

### Method 1: Using pip (Recommended)

1. Make sure Python is installed on your system
2. Open Command Prompt or PowerShell
3. Run:
```bash
pip install yt-dlp
```

### Method 2: Using Chocolatey

If you have Chocolatey package manager:
```bash
choco install yt-dlp
```

### Method 3: Download Binary

1. Download the latest Windows executable from:
   https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe

2. Rename it to `yt-dlp.exe` if needed

3. Option A - Add to PATH:
   - Move the file to a folder in your PATH (like `C:\Windows\System32`)
   - Or add the folder containing yt-dlp.exe to your PATH environment variable

4. Option B - Put in project folder:
   - Place `yt-dlp.exe` in your youtube-downloader folder

### Verify Installation

Open Command Prompt and run:
```bash
yt-dlp --version
```

You should see the version number if installed correctly.

## macOS

### Using Homebrew (Recommended)

```bash
brew install yt-dlp
```

### Using pip

```bash
pip3 install yt-dlp
```

### Verify Installation

```bash
yt-dlp --version
```

## Linux

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install yt-dlp
```

### Using pip

```bash
pip install yt-dlp
```

### Verify Installation

```bash
yt-dlp --version
```

## Troubleshooting

### Command not found

If you get "command not found" or "yt-dlp is not recognized":

1. Make sure yt-dlp is in your PATH
2. Try closing and reopening your terminal/command prompt
3. On Windows, you may need to restart your computer after adding to PATH

### Permission errors

On Linux/macOS, you might need to use `sudo`:
```bash
sudo pip install yt-dlp
```

### Python not installed

If pip doesn't work, you need to install Python first:
- Windows: https://www.python.org/downloads/
- macOS: `brew install python3`
- Linux: Usually pre-installed, or `sudo apt install python3 python3-pip`

## After Installation

1. Restart your terminal/command prompt
2. Verify installation: `yt-dlp --version`
3. Restart your Next.js dev server if it's running
4. Try the YouTube downloader app again!

## Need Help?

- yt-dlp GitHub: https://github.com/yt-dlp/yt-dlp
- Full installation guide: https://github.com/yt-dlp/yt-dlp#installation
- Issues: https://github.com/yt-dlp/yt-dlp/issues
