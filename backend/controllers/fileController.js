import File from '../models/File.js';
import { getIo } from '../config/socket.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { roomId } = req.body;

    const newFile = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      roomId: roomId || null,
    });

    const io = getIo();
    
    // Emit file uploaded event
    const eventData = {
      fileId: newFile._id,
      originalName: newFile.originalName,
      size: newFile.size,
      mimeType: newFile.mimeType,
      roomId: newFile.roomId,
    };

    if (roomId) {
      io.to(roomId).emit('file-uploaded', eventData);
    } else {
      io.emit('file-uploaded', eventData);
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
      downloadLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/download/${newFile._id}`
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found or expired' });
    }

    // Stream to client
    res.download(file.path, file.originalName, (err) => {
      if (err) {
        console.error('Download Error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Download Route Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
