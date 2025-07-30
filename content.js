// YouTube Video Skipper Content Script
let skipSeconds = 7;
let targetChannels = [];
let isEnabled = true;
let isInitialized = false;

// Load settings from storage
chrome.storage.sync.get(['skipSeconds', 'targetChannels', 'isEnabled'], function(result) {
  if (result.skipSeconds !== undefined) skipSeconds = result.skipSeconds;
  if (result.targetChannels !== undefined) targetChannels = result.targetChannels;
  if (result.isEnabled !== undefined) isEnabled = result.isEnabled;
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync') {
    if (changes.skipSeconds) skipSeconds = changes.skipSeconds.newValue;
    if (changes.targetChannels) targetChannels = changes.targetChannels.newValue;
    if (changes.isEnabled) isEnabled = changes.isEnabled.newValue;
  }
});

// Function to get current channel URL with multiple fallback methods
function getCurrentChannelUrl() {
  // Method 1: Try multiple selectors for channel links
  const selectors = [
    'ytd-video-owner-renderer #channel-name a',
    'ytd-channel-name #channel-name a',
    'ytd-video-owner-renderer #owner-name a',
    'ytd-video-owner-renderer #owner-sub-count a',
    'ytd-video-owner-renderer #owner-name a',
    'ytd-video-owner-renderer a[href*="/channel/"]',
    'ytd-video-owner-renderer a[href*="/@"]',
    'ytd-video-owner-renderer a[href*="/c/"]',
    'ytd-video-owner-renderer a[href*="/user/"]',
    '#owner-name a',
    '#channel-name a',
    'ytd-video-owner-renderer ytd-channel-name a',
    'ytd-video-owner-renderer yt-formatted-string a'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.href) {
      return element.href;
    }
  }

  // Method 2: Try to find any link that looks like a channel URL
  const allLinks = document.querySelectorAll('a[href*="youtube.com"]');
  for (const link of allLinks) {
    const href = link.href;
    if (href && (
      href.includes('/channel/') ||
      href.includes('/@') ||
      href.includes('/c/') ||
      href.includes('/user/')
    )) {
      // Make sure it's not a video URL
      if (!href.includes('/watch') && !href.includes('/embed')) {
        return href;
      }
    }
  }

  // Method 3: Try to extract from page metadata
  const metaChannel = document.querySelector('meta[property="og:url"]');
  if (metaChannel && metaChannel.content) {
    const content = metaChannel.content;
    if (content.includes('/channel/') || content.includes('/@') || content.includes('/c/') || content.includes('/user/')) {
      return content;
    }
  }

  return null;
}

// Function to extract channel ID from URL
function extractChannelId(url) {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([^\/\?]+)/,  // /channel/UC...
    /youtube\.com\/c\/([^\/\?]+)/,        // /c/channelname
    /youtube\.com\/@([^\/\?]+)/,          // /@channelname
    /youtube\.com\/user\/([^\/\?]+)/      // /user/username
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Function to skip video with better timing
function skipVideo() {
  if (!isEnabled) return;
  
  const video = document.querySelector('video');
  if (!video) return;
  
  const currentChannelUrl = getCurrentChannelUrl();
  if (!currentChannelUrl) {
    console.log('YouTube Video Skipper: Channel URL not found');
    return;
  }
  
  const currentChannelId = extractChannelId(currentChannelUrl);
  if (!currentChannelId) {
    console.log('YouTube Video Skipper: Could not extract channel ID from:', currentChannelUrl);
    return;
  }
  
  // Check if current channel is in target channels
  const isTargetChannel = targetChannels.some(channelUrl => {
    const targetChannelId = extractChannelId(channelUrl);
    return targetChannelId && targetChannelId === currentChannelId;
  });
  
  if (!isTargetChannel) {
    console.log('YouTube Video Skipper: Channel not in target list:', currentChannelId);
    return;
  }
  
  // Skip if video is in first few seconds and not already skipped
  if (video.currentTime < skipSeconds && !video.hasAttribute('data-skipped')) {
    video.currentTime = skipSeconds;
    video.setAttribute('data-skipped', 'true');
    console.log(`YouTube Video Skipper: Skipped to ${skipSeconds} seconds for channel: ${currentChannelId}`);
    
    // Remove the skipped attribute after a delay to allow for manual seeking
    setTimeout(() => {
      video.removeAttribute('data-skipped');
    }, 5000);
  }
}

// Function to handle video loading with multiple attempts
function handleVideoLoad() {
  // Wait for video to be ready
  setTimeout(() => {
    skipVideo();
  }, 1000);
  
  // Check multiple times with increasing delays
  const delays = [500, 1000, 2000, 3000, 5000];
  delays.forEach((delay, index) => {
    setTimeout(() => {
      skipVideo();
    }, delay);
  });
  
  // Also check periodically for the first 10 seconds
  let checkCount = 0;
  const maxChecks = 20;
  const checkInterval = setInterval(() => {
    skipVideo();
    checkCount++;
    if (checkCount >= maxChecks) {
      clearInterval(checkInterval);
    }
  }, 500);
}

// Function to initialize the extension
function initialize() {
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('YouTube Video Skipper: Initializing...');
  
  if (window.location.pathname === '/watch') {
    const video = document.querySelector('video');
    if (video) {
      video.setAttribute('data-skipper-initialized', 'true');
      handleVideoLoad();
    }
  }
  
  setupObserver();
}

// Observer to watch for video changes
let observer;
function setupObserver() {
  if (observer) {
    observer.disconnect();
  }
  
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if we're on a video page
        if (window.location.pathname === '/watch') {
          const video = document.querySelector('video');
          if (video && !video.hasAttribute('data-skipper-initialized')) {
            video.setAttribute('data-skipper-initialized', 'true');
            handleVideoLoad();
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start the extension with multiple initialization attempts
function startExtension() {
  // Try to initialize immediately
  initialize();
  
  // Also try after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  }
  
  // And after a short delay
  setTimeout(initialize, 1000);
  setTimeout(initialize, 3000);
}

// Handle navigation changes (YouTube is a SPA)
let currentUrl = location.href;
let urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== currentUrl) {
    currentUrl = url;
    isInitialized = false; // Reset initialization flag
    
    if (url.includes('/watch')) {
      console.log('YouTube Video Skipper: Navigation detected, reinitializing...');
      // Small delay to let the page load
      setTimeout(() => {
        const video = document.querySelector('video');
        if (video && !video.hasAttribute('data-skipper-initialized')) {
          video.setAttribute('data-skipper-initialized', 'true');
          handleVideoLoad();
        }
      }, 1000);
    }
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getChannelInfo') {
    const channelUrl = getCurrentChannelUrl();
    const channelId = extractChannelId(channelUrl);
    sendResponse({
      channelUrl: channelUrl,
      channelId: channelId
    });
  } else if (request.action === 'checkVideo') {
    const video = document.querySelector('video');
    sendResponse({
      videoFound: !!video
    });
  }
});

// Start the extension
startExtension();

// Additional fallback: check periodically for new videos
setInterval(() => {
  if (window.location.pathname === '/watch') {
    const video = document.querySelector('video');
    if (video && !video.hasAttribute('data-skipper-initialized')) {
      video.setAttribute('data-skipper-initialized', 'true');
      handleVideoLoad();
    }
  }
}, 5000); 