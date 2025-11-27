# Walk Report

A web application that builds PDF reports from images and audio recordings uploaded from a Raspberry Pi. Uses OpenAI Whisper for audio-to-text transcription.

## Features

- 📷 **Image Upload**: Upload images (JPEG, PNG, GIF, WebP) from your Raspberry Pi
- 🎤 **Audio Upload**: Upload audio recordings (MP3, WAV, M4A, OGG, WebM up to 25MB)
- 🗣️ **Transcription**: Convert audio to text using OpenAI Whisper
- 📄 **PDF Generation**: Create PDF reports combining images and transcribed text
- 🖥️ **Web Interface**: Simple drag-and-drop interface

## Prerequisites

- Node.js 18+ 
- OpenAI API key (for Whisper transcription)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/marcus184/walk-report.git
cd walk-report
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Usage

### Start the server

```bash
npm start
```

The server will start at `http://localhost:3000`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload/images` | Upload images |
| POST | `/api/upload/audio` | Upload audio files |
| POST | `/api/transcribe/:audioId` | Transcribe an audio file |
| GET | `/api/files` | Get all uploaded files |
| POST | `/api/generate-pdf` | Generate PDF report |
| DELETE | `/api/files/:type/:id` | Delete a specific file |
| DELETE | `/api/files` | Clear all files |

### Raspberry Pi Integration

You can upload files from your Raspberry Pi using `curl`:

```bash
# Upload images
curl -X POST -F "images=@photo.jpg" http://your-server:3000/api/upload/images

# Upload audio
curl -X POST -F "audio=@recording.mp3" http://your-server:3000/api/upload/audio
```

### Example Raspberry Pi Script

Create a script on your Raspberry Pi to automatically upload files:

```bash
#!/bin/bash
SERVER_URL="http://your-server:3000"

# Upload all images from a directory
for img in /path/to/images/*.jpg; do
  curl -X POST -F "images=@$img" "$SERVER_URL/api/upload/images"
done

# Upload all audio files
for audio in /path/to/audio/*.mp3; do
  curl -X POST -F "audio=@$audio" "$SERVER_URL/api/upload/audio"
done
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test
```

## License

ISC
