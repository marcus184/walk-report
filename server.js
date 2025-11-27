require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Generate a unique ID using crypto
function generateId() {
  return crypto.randomUUID();
}

// Initialize OpenAI client lazily
let openai = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 upload requests per windowMs
  message: { error: 'Too many upload requests, please try again later.' },
});

const transcribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 transcription requests per windowMs
  message: { error: 'Too many transcription requests, please try again later.' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(generalLimiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg', 'audio/webm'];

  if (allowedImageTypes.includes(file.mimetype) || allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and audio files (MP3, WAV, M4A, OGG, WebM) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for Whisper API
});

// In-memory storage for uploaded files and transcriptions
const uploadedFiles = {
  images: [],
  audio: [],
  transcriptions: [],
};

// API Routes

// Upload images
app.post('/api/upload/images', uploadLimiter, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }

  const uploaded = req.files.map((file) => ({
    id: generateId(),
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));

  uploadedFiles.images.push(...uploaded);

  res.json({
    message: 'Images uploaded successfully',
    files: uploaded,
  });
});

// Upload audio files
app.post('/api/upload/audio', uploadLimiter, upload.array('audio', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No audio files uploaded' });
  }

  const uploaded = req.files.map((file) => ({
    id: generateId(),
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    transcription: null,
  }));

  uploadedFiles.audio.push(...uploaded);

  res.json({
    message: 'Audio files uploaded successfully',
    files: uploaded,
  });
});

// Transcribe audio using OpenAI Whisper
app.post('/api/transcribe/:audioId', transcribeLimiter, async (req, res) => {
  const { audioId } = req.params;

  const audioFile = uploadedFiles.audio.find((a) => a.id === audioId);
  if (!audioFile) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const client = getOpenAI();
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
    });

    audioFile.transcription = transcription.text;
    uploadedFiles.transcriptions.push({
      audioId: audioFile.id,
      text: transcription.text,
    });

    res.json({
      message: 'Transcription successful',
      audioId: audioFile.id,
      transcription: transcription.text,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

// Get all uploaded files
app.get('/api/files', (req, res) => {
  res.json({
    images: uploadedFiles.images,
    audio: uploadedFiles.audio,
    transcriptions: uploadedFiles.transcriptions,
  });
});

// Generate PDF with images and transcriptions
app.post('/api/generate-pdf', uploadLimiter, async (req, res) => {
  const { title = 'Walk Report', includeImages = true, includeTranscriptions = true } = req.body;

  if (uploadedFiles.images.length === 0 && uploadedFiles.transcriptions.length === 0) {
    return res.status(400).json({ error: 'No content available for PDF generation' });
  }

  try {
    const doc = new PDFDocument({ margin: 50 });
    const pdfPath = path.join(uploadsDir, `report-${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(2);

    // Add date
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add transcriptions
    if (includeTranscriptions && uploadedFiles.transcriptions.length > 0) {
      doc.fontSize(18).font('Helvetica-Bold').text('Transcribed Notes', { underline: true });
      doc.moveDown();

      uploadedFiles.transcriptions.forEach((trans, index) => {
        doc.fontSize(12).font('Helvetica').text(`${index + 1}. ${trans.text}`);
        doc.moveDown();
      });

      doc.moveDown();
    }

    // Add images
    if (includeImages && uploadedFiles.images.length > 0) {
      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold').text('Images', { underline: true });
      doc.moveDown();

      for (const image of uploadedFiles.images) {
        try {
          if (fs.existsSync(image.path)) {
            // Calculate image dimensions to fit on page
            const pageWidth = doc.page.width - 100;
            doc.image(image.path, {
              fit: [pageWidth, 400],
              align: 'center',
            });
            doc.moveDown();
            doc.fontSize(10).font('Helvetica-Oblique').text(image.originalname, { align: 'center' });
            doc.moveDown(2);

            // Add new page if needed for next image
            if (doc.y > doc.page.height - 200) {
              doc.addPage();
            }
          }
        } catch (imgError) {
          console.error(`Error adding image ${image.filename}:`, imgError);
        }
      }
    }

    doc.end();

    writeStream.on('finish', () => {
      res.download(pdfPath, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up the generated PDF after download
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to cleanup PDF file:', unlinkErr);
          }
        });
      });
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Delete uploaded file
app.delete('/api/files/:type/:id', uploadLimiter, (req, res) => {
  const { type, id } = req.params;

  if (type !== 'images' && type !== 'audio') {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  const fileIndex = uploadedFiles[type].findIndex((f) => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = uploadedFiles[type][fileIndex];

  // Delete file from disk
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // Remove from array
  uploadedFiles[type].splice(fileIndex, 1);

  // If audio, also remove transcription
  if (type === 'audio') {
    const transIndex = uploadedFiles.transcriptions.findIndex((t) => t.audioId === id);
    if (transIndex !== -1) {
      uploadedFiles.transcriptions.splice(transIndex, 1);
    }
  }

  res.json({ message: 'File deleted successfully' });
});

// Clear all files
app.delete('/api/files', (req, res) => {
  // Delete all files from disk
  [...uploadedFiles.images, ...uploadedFiles.audio].forEach((file) => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });

  // Clear arrays
  uploadedFiles.images = [];
  uploadedFiles.audio = [];
  uploadedFiles.transcriptions = [];

  res.json({ message: 'All files cleared successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start server if run directly (not when required as module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Walk Report server running on port ${PORT}`);
    console.log(`OpenAI Whisper integration: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured (set OPENAI_API_KEY)'}`);
  });
}

module.exports = app;
