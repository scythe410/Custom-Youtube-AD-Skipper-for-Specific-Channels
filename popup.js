// Popup script for YouTube Video Skipper
document.addEventListener('DOMContentLoaded', function() {
    const enabledCheckbox = document.getElementById('enabled');
    const skipSecondsInput = document.getElementById('skipSeconds');
    const channelInput = document.getElementById('channelInput');
    const addChannelBtn = document.getElementById('addChannel');
    const addCurrentChannelBtn = document.getElementById('addCurrentChannel');
    const toggleDebugBtn = document.getElementById('toggleDebug');
    const channelList = document.getElementById('channelList');
    const statusDiv = document.getElementById('status');
    const channelNameSpan = document.getElementById('channelName');
    const debugSection = document.getElementById('debugSection');

    // Debug elements
    const debugChannelUrl = document.getElementById('debugChannelUrl');
    const debugChannelId = document.getElementById('debugChannelId');
    const debugIsTarget = document.getElementById('debugIsTarget');
    const debugEnabled = document.getElementById('debugEnabled');
    const debugSkipSeconds = document.getElementById('debugSkipSeconds');
    const debugVideoFound = document.getElementById('debugVideoFound');

    // Load saved settings
    chrome.storage.sync.get(['isEnabled', 'skipSeconds', 'targetChannels'], function(result) {
        enabledCheckbox.checked = result.isEnabled !== false; // Default to true
        skipSecondsInput.value = result.skipSeconds || 7;
        updateChannelList(result.targetChannels || []);
    });

    // Get current channel info from active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getChannelInfo'}, function(response) {
                if (response && response.channelUrl) {
                    channelNameSpan.textContent = response.channelUrl;
                    // Store current channel info for the "Add Current Channel" button
                    window.currentChannelUrl = response.channelUrl;
                    window.currentChannelId = response.channelId;
                    
                    // Update debug info
                    updateDebugInfo(response);
                } else {
                    channelNameSpan.textContent = 'Channel URL not found';
                    updateDebugInfo({channelUrl: null, channelId: null});
                }
            });
        } else {
            channelNameSpan.textContent = 'Not on a YouTube video page';
            updateDebugInfo({channelUrl: null, channelId: null});
        }
    });

    // Update debug information
    function updateDebugInfo(channelInfo) {
        chrome.storage.sync.get(['isEnabled', 'skipSeconds', 'targetChannels'], function(result) {
            const isEnabled = result.isEnabled !== false;
            const skipSeconds = result.skipSeconds || 7;
            const targetChannels = result.targetChannels || [];
            
            debugChannelUrl.textContent = channelInfo.channelUrl || 'Not detected';
            debugChannelId.textContent = channelInfo.channelId || 'Not extracted';
            debugEnabled.textContent = isEnabled ? 'Yes' : 'No';
            debugSkipSeconds.textContent = skipSeconds + ' seconds';
            
            // Check if current channel is in target list
            let isTarget = 'No';
            if (channelInfo.channelId) {
                isTarget = targetChannels.some(channelUrl => {
                    const targetChannelId = extractChannelId(channelUrl);
                    return targetChannelId && targetChannelId === channelInfo.channelId;
                }) ? 'Yes' : 'No';
            }
            debugIsTarget.textContent = isTarget;
            
            // Check if video element exists
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'checkVideo'}, function(response) {
                        debugVideoFound.textContent = response && response.videoFound ? 'Yes' : 'No';
                    });
                } else {
                    debugVideoFound.textContent = 'Not on video page';
                }
            });
        });
    }

    // Extract channel ID from URL (same function as in content script)
    function extractChannelId(url) {
        if (!url) return null;
        
        const patterns = [
            /youtube\.com\/channel\/([^\/\?]+)/,
            /youtube\.com\/c\/([^\/\?]+)/,
            /youtube\.com\/@([^\/\?]+)/,
            /youtube\.com\/user\/([^\/\?]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    // Toggle debug section
    toggleDebugBtn.addEventListener('click', function() {
        const isVisible = debugSection.style.display !== 'none';
        debugSection.style.display = isVisible ? 'none' : 'block';
        toggleDebugBtn.textContent = isVisible ? 'Show Debug Info' : 'Hide Debug Info';
        
        if (!isVisible) {
            // Refresh debug info when showing
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'getChannelInfo'}, function(response) {
                        updateDebugInfo(response || {channelUrl: null, channelId: null});
                    });
                }
            });
        }
    });

    // Save enabled state
    enabledCheckbox.addEventListener('change', function() {
        chrome.storage.sync.set({isEnabled: enabledCheckbox.checked}, function() {
            showStatus('Extension ' + (enabledCheckbox.checked ? 'enabled' : 'disabled'), 'success');
            updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
        });
    });

    // Save skip seconds
    skipSecondsInput.addEventListener('change', function() {
        const seconds = parseInt(skipSecondsInput.value);
        if (seconds >= 1 && seconds <= 60) {
            chrome.storage.sync.set({skipSeconds: seconds}, function() {
                showStatus('Skip time updated to ' + seconds + ' seconds', 'success');
                updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
            });
        } else {
            showStatus('Please enter a value between 1 and 60', 'error');
            skipSecondsInput.value = 7;
        }
    });

    // Validate YouTube channel URL
    function isValidChannelUrl(url) {
        if (!url) return false;
        
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/channel\/[^\/\?]+/,
            /^https?:\/\/(www\.)?youtube\.com\/c\/[^\/\?]+/,
            /^https?:\/\/(www\.)?youtube\.com\/@[^\/\?]+/,
            /^https?:\/\/(www\.)?youtube\.com\/user\/[^\/\?]+/
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }

    // Add channel from input
    addChannelBtn.addEventListener('click', function() {
        const channelUrl = channelInput.value.trim();
        if (channelUrl) {
            if (isValidChannelUrl(channelUrl)) {
                chrome.storage.sync.get(['targetChannels'], function(result) {
                    const channels = result.targetChannels || [];
                    if (!channels.includes(channelUrl)) {
                        channels.push(channelUrl);
                        chrome.storage.sync.set({targetChannels: channels}, function() {
                            updateChannelList(channels);
                            channelInput.value = '';
                            showStatus('Channel URL added successfully', 'success');
                            updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
                        });
                    } else {
                        showStatus('Channel URL already exists', 'error');
                    }
                });
            } else {
                showStatus('Please enter a valid YouTube channel URL', 'error');
            }
        } else {
            showStatus('Please enter a channel URL', 'error');
        }
    });

    // Add current channel
    addCurrentChannelBtn.addEventListener('click', function() {
        if (window.currentChannelUrl) {
            chrome.storage.sync.get(['targetChannels'], function(result) {
                const channels = result.targetChannels || [];
                if (!channels.includes(window.currentChannelUrl)) {
                    channels.push(window.currentChannelUrl);
                    chrome.storage.sync.set({targetChannels: channels}, function() {
                        updateChannelList(channels);
                        showStatus('Current channel added successfully', 'success');
                        updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
                    });
                } else {
                    showStatus('Current channel already exists', 'error');
                }
            });
        } else {
            showStatus('No channel detected on current page', 'error');
        }
    });

    // Enter key to add channel
    channelInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addChannelBtn.click();
        }
    });

    // Update channel list display
    function updateChannelList(channels) {
        channelList.innerHTML = '';
        if (channels.length === 0) {
            channelList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.7); font-style: italic;">No channels added yet</div>';
            return;
        }

        channels.forEach(function(channelUrl, index) {
            const channelItem = document.createElement('div');
            channelItem.className = 'channel-item';
            
            const channelUrlSpan = document.createElement('div');
            channelUrlSpan.className = 'channel-url';
            channelUrlSpan.textContent = channelUrl;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = function() {
                removeChannel(index);
            };
            
            channelItem.appendChild(channelUrlSpan);
            channelItem.appendChild(removeBtn);
            channelList.appendChild(channelItem);
        });
    }

    // Remove channel
    function removeChannel(index) {
        chrome.storage.sync.get(['targetChannels'], function(result) {
            const channels = result.targetChannels || [];
            const removedChannel = channels[index];
            channels.splice(index, 1);
            chrome.storage.sync.set({targetChannels: channels}, function() {
                updateChannelList(channels);
                showStatus('Channel removed successfully', 'success');
                updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
            });
        });
    }

    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Add example channels button
    const addExampleChannels = document.createElement('button');
    addExampleChannels.textContent = 'Add Example Channels';
    addExampleChannels.style.marginTop = '10px';
    addExampleChannels.style.background = 'linear-gradient(45deg, #FF6B6B, #FF8E53)';
    addExampleChannels.onclick = function() {
        const exampleChannels = [
            'https://www.youtube.com/@MrBeast',
            'https://www.youtube.com/@PewDiePie',
            'https://www.youtube.com/@Markiplier'
        ];
        chrome.storage.sync.get(['targetChannels'], function(result) {
            const channels = result.targetChannels || [];
            let addedCount = 0;
            exampleChannels.forEach(function(channelUrl) {
                if (!channels.includes(channelUrl)) {
                    channels.push(channelUrl);
                    addedCount++;
                }
            });
            chrome.storage.sync.set({targetChannels: channels}, function() {
                updateChannelList(channels);
                showStatus(`Added ${addedCount} example channels`, 'success');
                updateDebugInfo({channelUrl: window.currentChannelUrl, channelId: window.currentChannelId});
            });
        });
    };
    
    document.querySelector('.container').appendChild(addExampleChannels);
}); 