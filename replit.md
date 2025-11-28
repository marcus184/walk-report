# Walk Report - File Manager

## Overview
A web application for managing files uploaded from Raspberry Pi Zero 2 and creating PDFs by dragging and dropping images. The app provides an interactive file browser, image preview, drag-and-drop functionality, and client-side PDF generation.

**Current State**: Configured for Replit environment
**Last Updated**: November 28, 2025

## Project Architecture

### Technology Stack
- **Backend**: Node.js with Express (port 5000)
- **Frontend**: Vanilla JavaScript with HTML/CSS
- **File Upload**: Multer middleware
- **PDF Generation**: jsPDF library (client-side)

### Directory Structure
```
walk-report/
├── server.js           # Express server (backend)
├── package.json        # Node.js dependencies
├── public/             # Frontend files
│   ├── index.html     # Main HTML page
│   ├── styles.css     # Styling
│   └── app.js         # Frontend logic
├── uploads/           # Uploaded image files (auto-created)
├── pdfs/              # Generated PDF files (auto-created)
└── upload-example.py  # Python script for Raspberry Pi uploads
```

### Key Features
1. **File Upload**: Files can be uploaded via web UI or Raspberry Pi using curl/HTTP POST
2. **Image Browser**: View all uploaded images with thumbnails
3. **PDF Builder**: Drag and drop images to create PDFs
4. **PDF Storage**: Generated PDFs are saved on the server and can be downloaded

### API Endpoints
- `POST /api/upload` - Upload files from Raspberry Pi or web UI
- `GET /api/files` - Get list of all uploaded files
- `DELETE /api/files/:filename` - Delete a file
- `POST /api/pdf/save` - Save generated PDF to server
- `GET /api/pdfs` - Get list of all created PDFs
- `GET /uploads/:filename` - Access uploaded files
- `GET /pdfs/:filename` - Access generated PDFs

## Recent Changes

### November 28, 2025 - Replit Environment Setup
- Changed default port from 3000 to 5000 for Replit compatibility
- Updated server to bind to 0.0.0.0 for proper Replit routing
- Created replit.md documentation

## Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)

### File Limits
- Max upload file size: 50MB for images
- Max PDF file size: 100MB

### Storage
- Uploads directory: `./uploads` (auto-created)
- PDFs directory: `./pdfs` (auto-created)

## Development

### Running Locally
```bash
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start
```

### Raspberry Pi Integration
Use the included `upload-example.py` or curl to upload files:
```bash
curl -X POST -F "file=@/path/to/image.jpg" http://YOUR_REPL_URL/api/upload
```

## User Preferences
None specified yet.
