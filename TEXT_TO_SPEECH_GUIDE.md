# Text-to-Speech (TTS) Feature Guide

## Overview
The AI Study Assistant now includes Text-to-Speech functionality that automatically reads AI responses aloud in your selected language.

## Features

### 1. Auto-Speak Toggle
- **Voice ON** button (green with speaker icon 🔊): AI responses are automatically spoken
- **Voice OFF** button (gray with muted icon 🔇): AI responses are silent
- Located in the top-right corner of the chat interface

### 2. Multi-Language Support
The TTS system automatically speaks in the language you've selected:
- **English** (en-US): Clear American English voice
- **Hindi** (hi-IN): Native Hindi voice
- **Gujarati** (gu-IN): Native Gujarati voice

### 3. Visual Feedback
- When AI is speaking: "🔊 Speaking... (Click Voice OFF to stop)" appears below the input box
- The message pulses to indicate active speech

### 4. Controls
- **Stop Speaking**: Click the "Voice OFF" button to immediately stop any ongoing speech
- **Auto-speak**: Enabled by default, can be toggled on/off anytime
- **Manual Control**: Speech stops automatically when the message ends

## How It Works

1. **Automatic Speaking**: When Voice ON is enabled, every new AI response is automatically spoken after it finishes streaming
2. **Language Detection**: The voice automatically matches your selected language (English/Hindi/Gujarati)
3. **Smart Filtering**: The initial greeting message is not spoken to avoid repetition
4. **Interruption**: You can stop speaking at any time by clicking "Voice OFF"

## Browser Compatibility

✅ **Supported Browsers:**
- Google Chrome (recommended)
- Microsoft Edge
- Safari (macOS/iOS)
- Opera

❌ **Not Supported:**
- Firefox (limited Web Speech API support)

## Usage Tips

1. **First Time Use**: The browser may ask for permission to use speech synthesis - click "Allow"
2. **Volume Control**: Use your system volume to adjust the speech volume
3. **Speed**: Speech rate is set to 1.0 (normal speed) for optimal clarity
4. **Interruption**: If you want to read silently, just click "Voice OFF" before the AI responds

## Technical Details

- **API**: Uses Web Speech Synthesis API (built into modern browsers)
- **Voice Selection**: Automatically selects the best available voice for your language
- **Performance**: No server-side processing - all speech generation happens in your browser
- **Privacy**: No audio data is sent to servers - completely client-side

## Troubleshooting

**Problem**: No sound when Voice ON is enabled
- Check your system volume
- Ensure your browser supports Web Speech API
- Try refreshing the page
- Check if other websites can play audio

**Problem**: Wrong language voice
- Make sure you've selected the correct language (English/Hindi/Gujarati)
- Some browsers may not have all language voices installed
- Try using Chrome for best language support

**Problem**: Speech is too fast/slow
- Currently set to normal speed (1.0x)
- Contact support if you need speed adjustment options

## Future Enhancements (Planned)

- Voice selection (male/female voices)
- Speed control slider
- Pitch adjustment
- Pause/Resume functionality
- Read specific messages on demand

---

**Note**: This feature works entirely in your browser and requires no additional setup or API keys!
