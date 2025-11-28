# WAC - Walk Console

## Overview
WAC (Wearable Augmented Capture) is a professional operations console for managing walk data and creating field intelligence reports. The application features a modern dark-themed tactical console aesthetic inspired by Palantir/MAC-style interfaces with a zinc/matte black color palette and amber-orange accents.

**Current State**: Fully functional with React frontend + mobile optimization
**Last Updated**: November 28, 2025

## Project Architecture

### Technology Stack
- **Backend**: Node.js with Express (port 5001)
- **Frontend**: React + TypeScript + Vite (port 5000)
- **Styling**: Tailwind CSS v3 with custom design system
- **File Upload**: Multer middleware
- **PDF Generation**: jsPDF library (client-side)
- **Icons**: Lucide React

### Port Configuration
| Port | Server | Purpose | Visible To |
|------|--------|---------|------------|
| 5000 | Vite (React frontend) | User-facing web interface | Replit webview (public URL) |
| 5001 | Express (Node.js backend) | REST API for uploads, files, PDFs | Internal only, proxied via Vite |

**How it works:**
- **Users access the app via port 5000** - This is what Replit's webview shows
- The public URL (e.g., `https://your-repl.repl.co`) maps to port 5000
- Vite automatically proxies `/api/*`, `/uploads/*`, and `/pdfs/*` requests to port 5001
- WAC devices upload to the public URL which gets proxied to the backend

### Directory Structure
```
walk-report/
├── server.js              # Express API server (port 5001)
├── package.json           # Root Node.js dependencies
├── upload-example.py      # Python script for WAC device uploads
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AppShell.tsx
│   │   │   ├── AssetCard.tsx
│   │   │   ├── WalkDataPanel.tsx
│   │   │   ├── ReportBuilderPanel.tsx
│   │   │   ├── CreatedReportsStrip.tsx
│   │   │   ├── ImagePreviewModal.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── lib/
│   │   │   └── api.ts     # API client functions
│   │   ├── types/
│   │   │   └── index.ts   # TypeScript type definitions
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── public/
│   │   └── wac-logo.png   # WAC brand logo
│   ├── vite.config.ts     # Vite configuration with API proxy to port 5001
│   ├── tailwind.config.js # Tailwind theme configuration
│   └── package.json       # Frontend dependencies
├── uploads/               # Uploaded image files (auto-created)
└── pdfs/                  # Generated PDF files (auto-created)
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
2. **Report Builder**: Drag-and-drop (desktop) or tap-to-add (mobile) images to compose reports
3. **Created Reports Strip**: Scrolling list of generated PDF reports
4. **Image Preview Modal**: Full-size image view with notes and AI insight placeholder
5. **PDF Generation**: Client-side PDF creation with jsPDF
6. **File Upload**: Direct upload via web UI or from WAC devices
7. **Mobile Optimization**: Tab-based navigation, touch-friendly controls for screens < 768px

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image files from devices or web UI |
| GET | `/api/files` | Get list of all uploaded files with metadata |
| DELETE | `/api/files/:filename` | Delete a specific file |
| POST | `/api/pdf/save` | Save generated PDF to server |
| GET | `/api/pdfs` | Get list of all created PDFs |
| GET | `/uploads/:filename` | Access uploaded image files |
| GET | `/pdfs/:filename` | Access generated PDF files |

## WAC Device Upload

### Using curl (Command Line)
```bash
# Upload single file to Replit deployment
curl -X POST -F "file=@/path/to/image.jpg" https://YOUR-REPL-URL/api/upload

# Example with local development (Mac)
curl -X POST -F "file=@./capture.jpg" http://localhost:5001/api/upload
```

### Using Python Script
```bash
# Upload single file
python3 upload-example.py /home/pi/image.jpg https://YOUR-REPL-URL

# Upload all images in a directory
python3 upload-example.py /home/pi/captures/ https://YOUR-REPL-URL

# Local development (Mac)
python3 upload-example.py ./image.jpg http://localhost:5001
```

### Supported Image Formats
JPG, JPEG, PNG, GIF, BMP, WEBP (max 50MB per file)

## Raspberry Pi Upload Plan

### Overview
The WAC device (Raspberry Pi) can upload images to the WAC Console over WiFi. The Pi captures images and sends them to the server's `/api/upload` endpoint.

### Setup Steps

1. **Get Your Replit URL**
   - Click the "Open in new tab" button in the webview
   - Copy the URL (e.g., `https://walk-report-username.replit.app`)

2. **Install Python requests on Pi**
   ```bash
   pip3 install requests
   ```

3. **Copy the upload script to your Pi**
   ```bash
   scp upload-example.py pi@raspberrypi.local:/home/pi/
   ```

4. **Test upload from Pi**
   ```bash
   python3 upload-example.py /home/pi/test-image.jpg https://YOUR-REPL-URL
   ```

### Automated Upload (Cron Job)
To upload all new images every 5 minutes:

```bash
# Edit crontab
crontab -e

# Add this line (uploads all images from captures folder)
*/5 * * * * python3 /home/pi/upload-example.py /home/pi/captures/ https://YOUR-REPL-URL >> /home/pi/upload.log 2>&1
```

### Triggered Upload (On Capture)
For immediate upload after capture, add to your capture script:

```python
import subprocess

# After capturing image
subprocess.run([
    'python3', '/home/pi/upload-example.py',
    '/home/pi/latest-capture.jpg',
    'https://YOUR-REPL-URL'
])
```

### Network Requirements
- Pi must be connected to WiFi
- Pi must have internet access to reach Replit URL
- No special ports needed - uses standard HTTPS (port 443)

## Recent Changes

### November 28, 2025 - Mobile Optimization
- Added MobileNav component with bottom tab navigation
- Responsive layout: side-by-side panels on desktop, tabs on mobile
- Touch-friendly 44px+ tap targets
- Collapsible form sections on mobile
- Tap-to-add workflow replacing drag-and-drop on mobile

### November 28, 2025 - WAC Console Redesign
- Complete UI overhaul with React + TypeScript + Tailwind CSS
- New dark-themed Palantir/MAC-style tactical console design
- Added WAC branding with custom logo
- Implemented drag-and-drop from Walk Data to Report Builder
- Created responsive layout with Walk Data, Report Builder, and Reports Strip
- Added image preview modal with notes and AI placeholder
- Configured dual-server architecture (Express on 5001, Vite on 5000)

## Configuration

### Environment Variables
- `PORT`: Backend server port (default: 5001)
- `VITE_PORT`: Frontend server port (default: 5000)

### File Limits
- Max upload file size: 50MB for images
- Max PDF file size: 100MB

### Storage
- Uploads directory: `./uploads` (auto-created on server start)
- PDFs directory: `./pdfs` (auto-created on server start)

## Development

### Running the Application
The workflow runs both servers:
```bash
node server.js & cd client && npm run dev
```

### Troubleshooting
If you see "EADDRINUSE" errors, kill existing processes:
```bash
pkill -f "node server.js"; pkill -f "vite"
```

## User Preferences
- Accent color: Amber-orange (#f59e0b) - vibrant but not too orange
- Dark theme with professional tactical console aesthetic
- Backend port: 5001
