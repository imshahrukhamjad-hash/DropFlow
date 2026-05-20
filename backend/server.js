import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists or serve it as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('File Sharing API is running...');
});

// We will import and use routes here later
import fileRoutes from './routes/fileRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
app.use('/api/files', fileRoutes);
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
