# YouTube Video Skipper Extension

A Chrome extension that automatically skips the first 7 seconds (or custom duration) of videos on specific YouTube channels using channel URLs.

## Features

- ⏭️ **Automatic Video Skipping**: Automatically skips the first few seconds of videos on specified channels
- 🎯 **Channel-Specific**: Only affects videos from channels you specify using their URLs
- ⚙️ **Customizable Duration**: Set how many seconds to skip (1-60 seconds)
- 🎨 **Modern UI**: Beautiful, intuitive popup interface
- 🔄 **Real-time Updates**: Settings update immediately without page refresh
- 📱 **Responsive Design**: Works on different screen sizes
- 🔗 **URL-Based Detection**: Uses channel URLs for accurate identification

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Extension Files**
   - Download all the files in this folder to your computer
   - Make sure you have: `manifest.json`, `content.js`, `popup.html`, `popup.js`, and the icon files

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Or navigate to: Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing all the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "YouTube Video Skipper" and click the pin icon

### Method 2: Create Icons (Optional)

The extension includes placeholder files for icons. To add proper icons:

1. Create or download PNG images in these sizes:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels) 
   - `icon128.png` (128x128 pixels)

2. Replace the placeholder files with your actual icon files

## Usage

### Basic Setup

1. **Navigate to YouTube**
   - Go to any YouTube video page
   - Click the extension icon in your toolbar

2. **Configure Settings**
   - **Enable/Disable**: Toggle the extension on or off
   - **Skip Duration**: Set how many seconds to skip (default: 7)
   - **Add Channels**: Enter channel URLs you want to affect

3. **Add Target Channels**
   - **Method 1**: Paste a channel URL in the input field
   - **Method 2**: Click "Add Current Channel" while on a video page
   - **Method 3**: Click "Add Example Channels" for popular channels

### How to Get Channel URLs

1. **From a Video Page**:
   - Go to any video from the channel
   - Click on the channel name below the video
   - Copy the URL from your browser's address bar

2. **From Channel Page**:
   - Navigate directly to the channel page
   - Copy the URL from the address bar

3. **Supported URL Formats**:
   - `https://www.youtube.com/channel/UC...` (Channel ID)
   - `https://www.youtube.com/@channelname` (Handle)
   - `https://www.youtube.com/c/channelname` (Custom URL)
   - `https://www.youtube.com/user/username` (Username)

### Example Usage

1. **Add Popular Channels**:
   - Click "Add Example Channels" to add MrBeast, PewDiePie, and Markiplier
   - Or manually add your preferred channels using their URLs

2. **Customize Skip Time**:
   - Change the skip duration to 5 seconds for shorter intros
   - Or set it to 15 seconds for longer intros

3. **Test the Extension**:
   - Navigate to a video from one of your target channels
   - The video should automatically skip to your specified time
   - Check the browser console for confirmation messages

### Quick Add Current Channel

1. **While on a YouTube video**:
   - Click the extension icon
   - Click "Add Current Channel" button
   - The current channel will be added automatically

## File Structure

```
youtube-video-skipper/
├── manifest.json      # Extension configuration
├── content.js         # Main script that runs on YouTube pages
├── popup.html         # Extension popup interface
├── popup.js          # Popup functionality
├── icon16.png        # Small extension icon
├── icon48.png        # Medium extension icon
├── icon128.png       # Large extension icon
└── README.md         # This file
```

## How It Works

1. **Content Script**: Runs on YouTube pages and detects video elements
2. **Channel Detection**: Identifies the current video's channel URL
3. **URL Matching**: Compares channel URLs with your target list
4. **Skipping**: If matched, automatically skips to your specified time
5. **Settings**: Uses Chrome's storage API to save your preferences

## Troubleshooting

### Extension Not Working?

1. **Check if Enabled**: Make sure the extension is enabled in the popup
2. **Verify Channel URLs**: Ensure the channel URLs are correctly added
3. **Check Console**: Open browser console (F12) to see debug messages
4. **Refresh Page**: Try refreshing the YouTube page
5. **Reinstall**: Remove and reload the extension

### Channel Not Detected?

1. **Wait for Page Load**: YouTube is a single-page app, wait a moment
2. **Check URL**: Make sure you're on a video page (`/watch`)
3. **Manual Check**: Look at the channel URL displayed in the popup
4. **Try Different Methods**: Use the "Add Current Channel" button

### Common Issues

- **Videos Don't Skip**: Check if the channel URL is in your target list
- **Wrong Skip Time**: Verify the duration setting in the popup
- **Extension Disappears**: Make sure you pinned it to the toolbar
- **Invalid URL**: Make sure you're using a valid YouTube channel URL

## URL Validation

The extension validates channel URLs using these patterns:
- ✅ `https://www.youtube.com/channel/UC...`
- ✅ `https://www.youtube.com/@channelname`
- ✅ `https://www.youtube.com/c/channelname`
- ✅ `https://www.youtube.com/user/username`
- ❌ `https://www.youtube.com/watch?v=...` (Video URLs won't work)

## Customization

### Modify Skip Behavior

Edit `content.js` to change how the skipping works:
- Change the default skip time
- Modify the channel detection logic
- Add different skip conditions

### Update UI

Edit `popup.html` and `popup.js` to:
- Change the popup design
- Add new settings options
- Modify the user interface

## Privacy

This extension:
- ✅ Only runs on YouTube pages
- ✅ Only reads channel URLs and video timing
- ✅ Stores settings locally in your browser
- ✅ Does not collect or send any data
- ✅ Does not track your viewing history

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are present and correctly named
3. Try reinstalling the extension
4. Make sure you're using a recent version of Chrome
5. Ensure you're using valid YouTube channel URLs

## License

This extension is provided as-is for educational and personal use.

---

**Note**: This extension is not affiliated with YouTube or Google. Use at your own discretion. 