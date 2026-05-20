import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadFile, downloadFile } from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);

export default router;
