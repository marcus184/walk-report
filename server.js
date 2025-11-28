const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

// Ensure PDFs directory exists
const PDFS_DIR = path.join(__dirname, 'pdfs');
fs.mkdir(PDFS_DIR, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload endpoint for Raspberry Pi
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get list of files
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          name: filename,
          size: stats.size,
          modified: stats.mtime,
          isImage: /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename),
          url: `/uploads/${filename}`
        };
      })
    );
    
    // Sort by modified date (newest first)
    fileDetails.sort((a, b) => b.modified - a.modified);
    
    res.json(fileDetails);
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve PDFs
app.use('/pdfs', express.static(PDFS_DIR));

// Delete file endpoint
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Configure multer for PDF uploads
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PDFS_DIR);
  },
  filename: (req, file, cb) => {
    // Preserve the original filename if provided, otherwise generate one
    if (file.originalname && file.originalname.endsWith('.pdf')) {
      cb(null, file.originalname);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `walk-report-${uniqueSuffix}.pdf`);
    }
  }
});

const pdfUpload = multer({ 
  storage: pdfStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for PDFs
  fileFilter: (req, file, cb) => {
    // Accept PDF files - be lenient with MIME type checking
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/octet-stream' ||
        file.originalname.toLowerCase().endsWith('.pdf') ||
        !file.originalname) {
      cb(null, true);
    } else {
      console.warn('File rejected - not a PDF:', file.mimetype, file.originalname);
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Save PDF endpoint
app.post('/api/pdf/save', pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in PDF save request');
      return res.status(400).json({ error: 'No PDF uploaded' });
    }
    
    console.log('PDF saved successfully:', req.file.filename);
    res.json({
      success: true,
      filename: req.file.filename,
      path: `/pdfs/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    res.status(500).json({ error: `Failed to save PDF: ${error.message}` });
  }
});

// Get list of PDFs
app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfFiles = await fs.readdir(PDFS_DIR);
    const pdfDetails = await Promise.all(
      pdfFiles.map(async (filename) => {
        const filePath = path.join(PDFS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          name: filename,
          size: stats.size,
          modified: stats.mtime,
          url: `/pdfs/${filename}`
        };
      })
    );
    
    // Sort by modified date (newest first)
    pdfDetails.sort((a, b) => b.modified - a.modified);
    
    res.json(pdfDetails);
  } catch (error) {
    console.error('Error reading PDFs:', error);
    res.status(500).json({ error: 'Failed to read PDFs' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Uploads directory: ${UPLOADS_DIR}`);
  console.log(`PDFs directory: ${PDFS_DIR}`);
});

