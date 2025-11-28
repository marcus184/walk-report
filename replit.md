# WAC - Walk Console

## Overview
WAC (Wearable Augmented Capture) is a professional operations console for managing walk data and creating field intelligence reports. The application features a modern dark-themed tactical console aesthetic inspired by Palantir/MAC-style interfaces with a zinc/matte black color palette and amber-orange accents.

**Current State**: Fully functional with React frontend
**Last Updated**: November 28, 2025

## Project Architecture

### Technology Stack
- **Backend**: Node.js with Express (port 3001)
- **Frontend**: React + TypeScript + Vite (port 5000)
- **Styling**: Tailwind CSS v3 with custom design system
- **File Upload**: Multer middleware
- **PDF Generation**: jsPDF library (client-side)
- **Icons**: Lucide React

### Directory Structure
```
walk-report/
├── server.js              # Express API server (port 3001)
├── package.json           # Root Node.js dependencies
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AppShell.tsx
│   │   │   ├── AssetCard.tsx
│   │   │   ├── WalkDataPanel.tsx
│   │   │   ├── ReportBuilderPanel.tsx
│   │   │   ├── CreatedReportsStrip.tsx
│   │   │   └── ImagePreviewModal.tsx
│   │   ├── lib/
│   │   │   └── api.ts     # API client functions
│   │   ├── types/
│   │   │   └── index.ts   # TypeScript type definitions
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── public/
│   │   └── wac-logo.png   # WAC brand logo
│   ├── vite.config.ts     # Vite configuration with API proxy
│   ├── tailwind.config.js # Tailwind theme configuration
│   └── package.json       # Frontend dependencies
├── uploads/               # Uploaded image files (auto-created)
├── pdfs/                  # Generated PDF files (auto-created)
└── upload-example.py      # Python script for device uploads
```

### Design System
- **Primary Background**: #020617 (wac-bg)
- **Surface**: #0b1120 (wac-surface)
- **Card**: #111827 (wac-card)
- **Border**: #1e293b (wac-border)
- **Accent**: #f59e0b (amber-orange)
- **Text**: #f8fafc (light)
- **Text Muted**: #94a3b8

### Key Features
1. **Walk Data Panel**: Browse uploaded images with grid/list view, search, and filter chips
2. **Report Builder**: Drag-and-drop images to compose reports with metadata fields
3. **Created Reports Strip**: Horizontal scrolling list of generated PDF reports
4. **Image Preview Modal**: Full-size image view with notes and AI insight placeholder
5. **PDF Generation**: Client-side PDF creation with jsPDF
6. **File Upload**: Direct upload or import from WAC devices

### API Endpoints
- `POST /api/upload` - Upload files from devices or web UI
- `GET /api/files` - Get list of all uploaded files
- `DELETE /api/files/:filename` - Delete a file
- `POST /api/pdf/save` - Save generated PDF to server
- `GET /api/pdfs` - Get list of all created PDFs
- `GET /uploads/:filename` - Access uploaded files
- `GET /pdfs/:filename` - Access generated PDFs

## Recent Changes

### November 28, 2025 - WAC Console Redesign
- Complete UI overhaul with React + TypeScript + Tailwind CSS
- New dark-themed Palantir/MAC-style tactical console design
- Added WAC branding with custom logo
- Implemented drag-and-drop from Walk Data to Report Builder
- Created responsive layout with Walk Data, Report Builder, and Reports Strip
- Added image preview modal with notes and AI placeholder
- Configured dual-server architecture (Express on 3001, Vite on 5000)

## Configuration

### Environment Variables
- `PORT`: Backend server port (default: 3001)

### File Limits
- Max upload file size: 50MB for images
- Max PDF file size: 100MB

### Storage
- Uploads directory: `./uploads` (auto-created)
- PDFs directory: `./pdfs` (auto-created)

## Development

### Running the Application
The workflow runs both servers:
```bash
node server.js & cd client && npm run dev
```

### WAC Device Integration
Upload files from devices using curl:
```bash
curl -X POST -F "file=@/path/to/image.jpg" http://YOUR_REPL_URL/api/upload
```

## User Preferences
- Accent color: Amber-orange (#f59e0b) - vibrant but not too orange
- Dark theme with professional tactical console aesthetic
