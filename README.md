# Walk Report - File Manager

A web application to manage files from Raspberry Pi Zero 2 and create PDFs by dragging and dropping images.

## Features

- 📁 **Interactive File Browser**: View all files uploaded from Raspberry Pi
- 🖼️ **Image Preview**: See thumbnails of all images
- 🖱️ **Drag & Drop**: Easily add images to PDF by dragging or clicking
- 📄 **PDF Generation**: Create PDFs from selected images with automatic layout
- 🔄 **Real-time Updates**: Refresh to see new files from Raspberry Pi

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Uploading Files from Raspberry Pi

You can upload files from your Raspberry Pi using curl or any HTTP client:

```bash
curl -X POST -F "file=@/path/to/your/image.jpg" http://YOUR_SERVER_IP:3000/api/upload
```

Or create a simple upload script on your Raspberry Pi:

```python
import requests
import sys

url = "http://YOUR_SERVER_IP:3000/api/upload"
files = {'file': open(sys.argv[1], 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

### Creating PDFs

1. **View Files**: All uploaded files appear in the file browser on the left
2. **Select Images**: Click on images or drag them to the PDF Builder section
3. **Arrange**: Images are added in the order you select them
4. **Generate**: Click "Generate PDF" to create and download your PDF

## API Endpoints

- `POST /api/upload` - Upload a file from Raspberry Pi
- `GET /api/files` - Get list of all uploaded files
- `DELETE /api/files/:filename` - Delete a file
- `GET /uploads/:filename` - Access uploaded files

## Project Structure

```
walk-report/
├── server.js          # Express server
├── package.json       # Dependencies
├── public/            # Frontend files
│   ├── index.html    # Main HTML
│   ├── styles.css    # Styling
│   └── app.js        # Frontend logic
└── uploads/          # Uploaded files (created automatically)
```

## Configuration

- Default port: 3000 (change with `PORT` environment variable)
- Max file size: 50MB
- Upload directory: `./uploads`

## Notes

- Files are stored in the `uploads/` directory
- Images are automatically detected and displayed with thumbnails
- PDFs are generated client-side using jsPDF library
- The app supports all common image formats (JPG, PNG, GIF, BMP, WebP)
