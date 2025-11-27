// Global state
let files = [];
let selectedImages = [];
let pdfs = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    loadPDFs();
    setupEventListeners();
    setupDragAndDrop();
});

// Load files from server
async function loadFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '<div class="loading">Loading files...</div>';
    
    try {
        const response = await fetch('/api/files');
        files = await response.json();
        renderFiles();
    } catch (error) {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div class="loading">Error loading files. Please try again.</div>';
    }
}

// Render files in the browser
function renderFiles() {
    const fileList = document.getElementById('fileList');
    
    if (files.length === 0) {
        fileList.innerHTML = '<div class="loading">No files found. Upload files from Raspberry Pi.</div>';
        return;
    }
    
    fileList.innerHTML = files.map(file => {
        const isSelected = selectedImages.some(img => img.url === file.url);
        const fileSize = formatFileSize(file.size);
        const fileDate = new Date(file.modified).toLocaleDateString();
        
        if (file.isImage) {
            return `
                <div class="file-item ${isSelected ? 'selected' : ''}" data-url="${file.url}" data-name="${file.name}">
                    <img src="${file.url}" alt="${file.name}" loading="lazy">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    <div class="file-date">${fileDate}</div>
                </div>
            `;
        } else {
            return `
                <div class="file-item" data-url="${file.url}" data-name="${file.name}">
                    <div class="file-icon">📄</div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    <div class="file-date">${fileDate}</div>
                </div>
            `;
        }
    }).join('');
    
    // Add click listeners and make draggable
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            const name = item.dataset.name;
            const file = files.find(f => f.url === url);
            
            if (file && file.isImage) {
                toggleImageSelection(file);
            }
        });
        
        // Make draggable
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', (e) => {
            const url = item.dataset.url;
            e.dataTransfer.setData('text/plain', url);
        });
    });
}

// Toggle image selection
function toggleImageSelection(file) {
    const index = selectedImages.findIndex(img => img.url === file.url);
    
    if (index > -1) {
        selectedImages.splice(index, 1);
    } else {
        selectedImages.push(file);
    }
    
    renderSelectedImages();
    renderFiles(); // Re-render to update selection state
}

// Render selected images in PDF builder
function renderSelectedImages() {
    const container = document.getElementById('selectedImages');
    
    if (selectedImages.length === 0) {
        container.innerHTML = '<div class="empty-state">No images selected. Drag and drop or click images to add them.</div>';
        return;
    }
    
    container.innerHTML = selectedImages.map((image, index) => `
        <div class="selected-image" data-index="${index}">
            <img src="${image.url}" alt="${image.name}">
            <button class="remove-btn" onclick="removeImage(${index})">×</button>
            <div class="image-order">${index + 1}</div>
        </div>
    `).join('');
}

// Remove image from selection
function removeImage(index) {
    selectedImages.splice(index, 1);
    renderSelectedImages();
    renderFiles();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadFiles);
    document.getElementById('refreshPdfsBtn').addEventListener('click', loadPDFs);
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('clearBtn').addEventListener('click', () => {
        selectedImages = [];
        renderSelectedImages();
        renderFiles();
    });
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
}

// Load PDFs from server
async function loadPDFs() {
    const pdfList = document.getElementById('pdfList');
    pdfList.innerHTML = '<div class="loading">Loading PDFs...</div>';
    
    try {
        const response = await fetch('/api/pdfs');
        pdfs = await response.json();
        renderPDFs();
    } catch (error) {
        console.error('Error loading PDFs:', error);
        pdfList.innerHTML = '<div class="loading">Error loading PDFs. Please try again.</div>';
    }
}

// Render PDFs in the folder
function renderPDFs() {
    const pdfList = document.getElementById('pdfList');
    
    if (pdfs.length === 0) {
        pdfList.innerHTML = '<div class="loading">No PDFs created yet. Generate a PDF to see it here.</div>';
        return;
    }
    
    pdfList.innerHTML = pdfs.map(pdf => {
        const fileSize = formatFileSize(pdf.size);
        const fileDate = new Date(pdf.modified).toLocaleDateString();
        const fileTime = new Date(pdf.modified).toLocaleTimeString();
        
        return `
            <div class="pdf-item">
                <div class="pdf-icon">📄</div>
                <div class="pdf-info">
                    <div class="pdf-name">${pdf.name}</div>
                    <div class="pdf-details">
                        <span class="pdf-size">${fileSize}</span>
                        <span class="pdf-date">${fileDate} ${fileTime}</span>
                    </div>
                </div>
                <button class="btn btn-primary download-pdf-btn" data-url="${pdf.url}" data-name="${pdf.name}">
                    ⬇️ Download
                </button>
            </div>
        `;
    }).join('');
    
    // Add download button listeners
    document.querySelectorAll('.download-pdf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            const name = btn.dataset.name;
            downloadPDF(url, name);
        });
    });
}

// Download PDF
function downloadPDF(url, name) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Handle file upload
async function handleFileUpload(event) {
    const filesToUpload = Array.from(event.target.files);
    
    if (filesToUpload.length === 0) {
        return;
    }
    
    const uploadBtn = document.getElementById('uploadBtn');
    const originalText = uploadBtn.textContent;
    uploadBtn.disabled = true;
    uploadBtn.textContent = `Uploading ${filesToUpload.length} file(s)...`;
    
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '<div class="loading">Uploading files...</div>';
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of filesToUpload) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                successCount++;
            } else {
                errorCount++;
                console.error(`Failed to upload ${file.name}`);
            }
        } catch (error) {
            errorCount++;
            console.error(`Error uploading ${file.name}:`, error);
        }
    }
    
    // Reset file input
    event.target.value = '';
    
    // Update button state
    uploadBtn.disabled = false;
    uploadBtn.textContent = originalText;
    
    // Show feedback
    if (successCount > 0) {
        if (errorCount > 0) {
            alert(`Uploaded ${successCount} file(s) successfully. ${errorCount} file(s) failed.`);
        } else {
            alert(`Successfully uploaded ${successCount} file(s)!`);
        }
    } else {
        alert('Failed to upload files. Please try again.');
    }
    
    // Refresh file list
    await loadFiles();
}

// Setup drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const items = Array.from(e.dataTransfer.items);
        
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file.type.startsWith('image/')) {
                    // If it's a file from the file system, we need to check if it's already in our files
                    // For now, we'll handle drag from file browser items
                }
            }
        }
        
        // Handle drag from file browser
        const draggedUrl = e.dataTransfer.getData('text/plain');
        if (draggedUrl) {
            const file = files.find(f => f.url === draggedUrl);
            if (file && file.isImage && !selectedImages.some(img => img.url === file.url)) {
                selectedImages.push(file);
                renderSelectedImages();
                renderFiles();
            }
        }
    });
    
    // Make file items draggable
    document.addEventListener('DOMContentLoaded', () => {
        // This will be set up after files are rendered
    });
}


// Generate PDF
async function generatePDF() {
    if (selectedImages.length === 0) {
        alert('Please select at least one image to create a PDF.');
        return;
    }
    
    const btn = document.getElementById('generatePdfBtn');
    btn.disabled = true;
    btn.textContent = 'Generating PDF...';
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imageWidth = pageWidth - (2 * margin);
        
        for (let i = 0; i < selectedImages.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = selectedImages[i].url;
                });
                
                // Calculate height maintaining aspect ratio
                const aspectRatio = img.height / img.width;
                const imageHeight = imageWidth * aspectRatio;
                
                // If image is too tall, scale it down
                let finalHeight = imageHeight;
                let finalWidth = imageWidth;
                
                if (imageHeight > pageHeight - (2 * margin)) {
                    finalHeight = pageHeight - (2 * margin);
                    finalWidth = finalHeight / aspectRatio;
                }
                
                // Center the image
                const x = (pageWidth - finalWidth) / 2;
                const y = margin;
                
                pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
                
                // Add filename as caption
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                const textY = y + finalHeight + 5;
                if (textY < pageHeight - 5) {
                    pdf.text(selectedImages[i].name, margin, textY);
                }
            } catch (error) {
                console.error(`Error adding image ${i + 1}:`, error);
            }
        }
        
        // Generate PDF as blob
        let pdfBlob;
        try {
            pdfBlob = pdf.output('blob');
        } catch (blobError) {
            // Fallback: use arraybuffer and convert to blob
            console.warn('Blob output failed, using arraybuffer fallback:', blobError);
            const arrayBuffer = pdf.output('arraybuffer');
            pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `walk-report-${timestamp}.pdf`;
        
        // Create a File object with proper MIME type
        const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
        
        // Verify the file was created correctly
        if (!pdfFile || pdfFile.size === 0) {
            throw new Error('PDF file is empty or could not be created');
        }
        
        console.log('PDF file created:', filename, 'Size:', pdfFile.size, 'bytes');
        
        // Save PDF to server
        const formData = new FormData();
        formData.append('pdf', pdfFile, filename);
        
        const response = await fetch('/api/pdf/save', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`PDF generated successfully with ${selectedImages.length} image(s)!`);
            // Refresh PDF list
            await loadPDFs();
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || 'Failed to save PDF to server');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        const errorMessage = error.message || 'Unknown error occurred';
        alert(`Error generating PDF: ${errorMessage}. Please check the console for details.`);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate PDF';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

