const request = require('supertest');
const app = require('./server');
const fs = require('fs');
const path = require('path');

describe('Walk Report API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('openaiConfigured');
    });
  });

  describe('GET /api/files', () => {
    it('should return file lists', async () => {
      const response = await request(app).get('/api/files');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(response.body).toHaveProperty('audio');
      expect(response.body).toHaveProperty('transcriptions');
      expect(Array.isArray(response.body.images)).toBe(true);
      expect(Array.isArray(response.body.audio)).toBe(true);
      expect(Array.isArray(response.body.transcriptions)).toBe(true);
    });
  });

  describe('POST /api/upload/images', () => {
    it('should return error when no files uploaded', async () => {
      const response = await request(app)
        .post('/api/upload/images');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No images uploaded');
    });
  });

  describe('POST /api/upload/audio', () => {
    it('should return error when no files uploaded', async () => {
      const response = await request(app)
        .post('/api/upload/audio');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No audio files uploaded');
    });
  });

  describe('POST /api/generate-pdf', () => {
    it('should return error when no content available', async () => {
      // First clear all files to ensure empty state
      await request(app).delete('/api/files');
      
      const response = await request(app)
        .post('/api/generate-pdf')
        .send({ title: 'Test Report' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No content available for PDF generation');
    });
  });

  describe('DELETE /api/files/:type/:id', () => {
    it('should return error for invalid file type', async () => {
      const response = await request(app)
        .delete('/api/files/invalid/123');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid file type');
    });

    it('should return error when file not found', async () => {
      const response = await request(app)
        .delete('/api/files/images/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('File not found');
    });
  });

  describe('POST /api/transcribe/:audioId', () => {
    it('should return error when audio file not found', async () => {
      const response = await request(app)
        .post('/api/transcribe/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Audio file not found');
    });
  });
});
