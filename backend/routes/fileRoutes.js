import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadFile, downloadFile, getFileInfo } from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);
router.get('/info/:id', getFileInfo);

export default router;
