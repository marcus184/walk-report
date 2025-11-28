import type { WalkFile, PDFFile } from '../types';

const API_BASE = '';

export async function fetchFiles(): Promise<WalkFile[]> {
  const response = await fetch(`${API_BASE}/api/files`);
  if (!response.ok) throw new Error('Failed to fetch files');
  return response.json();
}

export async function fetchPDFs(): Promise<PDFFile[]> {
  const response = await fetch(`${API_BASE}/api/pdfs`);
  if (!response.ok) throw new Error('Failed to fetch PDFs');
  return response.json();
}

export async function uploadFile(file: File): Promise<WalkFile> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload file');
  return response.json();
}

export async function deleteFile(filename: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/files/${filename}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete file');
}

export async function savePDF(pdfBlob: Blob, filename: string): Promise<{ filename: string; path: string }> {
  const formData = new FormData();
  formData.append('pdf', new File([pdfBlob], filename, { type: 'application/pdf' }), filename);
  
  const response = await fetch(`${API_BASE}/api/pdf/save`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to save PDF');
  return response.json();
}
